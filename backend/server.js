const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// HOSPITAL REGISTRATION
// ===============================

app.post("/api/hospital-register", (req, res) => {
  const {
    hospital_name,
    address,
    phone,
    email,
    password,
    hospital_type,
    registration_number,
    latitude,
    longitude,
  } = req.body;

  if (!hospital_name || !address || !email || !password) {
    return res.status(400).json({
      message: "Hospital name, address, email and password are required.",
    });
  }

  const sql = `
    INSERT INTO hospital_registration_requests
    (
      hospital_name,
      address,
      phone,
      email,
      password,
      hospital_type,
      registration_number,
      latitude,
      longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      hospital_name,
      address,
      phone || null,
      email,
      password,
      hospital_type || null,
      registration_number || null,
      latitude || null,
      longitude || null,
    ],
    (error, result) => {
      if (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "A hospital registration with this email already exists.",
          });
        }

        return res.status(500).json({
          message: "Hospital registration failed.",
        });
      }

      res.status(201).json({
        message: "Hospital registration submitted successfully!",
        registration_id: result.insertId,
        status: "PENDING",
      });
    }
  );
});

// ===============================
// GET HOSPITAL REGISTRATION REQUESTS
// ===============================

app.get("/api/hospital-registration-requests", (req, res) => {
  const sql = `
    SELECT
      registration_id,
      hospital_name,
      address,
      phone,
      email,
      hospital_type,
      registration_number,
      latitude,
      longitude,
      status,
      created_at
    FROM hospital_registration_requests
    ORDER BY created_at DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospital registration requests.",
      });
    }

    res.json(results);
  });
});


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "smartcare",
});

// ===============================
// MYSQL CONNECTION
// ===============================

db.connect((error) => {
  if (error) {
    console.error("MySQL connection failed:", error);
  } else {
    console.log("MySQL connected successfully!");
  }
});

// ===============================
// APPROVE HOSPITAL REGISTRATION
// ===============================

app.put("/api/hospital-registration/:id/approve", (req, res) => {
  const registrationId = req.params.id;

  const getRequestSql = `
    SELECT *
    FROM hospital_registration_requests
    WHERE registration_id = ? AND status = 'PENDING'
  `;

  db.query(getRequestSql, [registrationId], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospital registration.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Pending hospital registration not found.",
      });
    }

    const hospital = results[0];

    // ===============================
    // CREATE HOSPITAL
    // ===============================

    const insertHospitalSql = `
      INSERT INTO hospitals
      (
        name,
        address,
        phone,
        latitude,
        longitude
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertHospitalSql,
      [
        hospital.hospital_name,
        hospital.address,
        hospital.phone || "",
        hospital.latitude || null,
        hospital.longitude || null,
      ],
      (hospitalError, hospitalResult) => {
        if (hospitalError) {
          console.error(hospitalError);

          return res.status(500).json({
            message: "Failed to create hospital.",
          });
        }

        const hospitalId = hospitalResult.insertId;

        // ===============================
        // CREATE HOSPITAL LOGIN
        // ===============================

        const insertUserSql = `
          INSERT INTO hospital_users
          (
            hospital_id,
            email,
            password
          )
          VALUES (?, ?, ?)
        `;

        db.query(
          insertUserSql,
          [
            hospitalId,
            hospital.email,
            hospital.password,
          ],
          (userError) => {
            if (userError) {
              console.error(userError);

              return res.status(500).json({
                message: "Hospital created, but hospital login creation failed.",
              });
            }

            // ===============================
            // CREATE INITIAL HOSPITAL STATUS
            // ===============================

            const insertStatusSql = `
              INSERT INTO hospital_status
              (
                hospital_id,
                general_available,
                icu_available,
                emergency_available,
                queue_count,
                status_mode,
                data_source
              )
              VALUES (?, 0, 0, 0, 0, 'DEMO', 'Hospital Dashboard')
            `;

            db.query(
              insertStatusSql,
              [hospitalId],
              (statusError) => {
                if (statusError) {
                  console.error(statusError);

                  return res.status(500).json({
                    message:
                      "Hospital and login created, but status creation failed.",
                  });
                }

                // ===============================
                // UPDATE REGISTRATION STATUS
                // ===============================

                const updateRequestSql = `
                  UPDATE hospital_registration_requests
                  SET status = 'APPROVED'
                  WHERE registration_id = ?
                `;

                db.query(
                  updateRequestSql,
                  [registrationId],
                  (updateError) => {
                    if (updateError) {
                      console.error(updateError);

                      return res.status(500).json({
                        message:
                          "Hospital created, but registration status update failed.",
                      });
                    }

                    res.json({
                      message: "Hospital registration approved successfully.",
                      hospital_id: hospitalId,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// ===============================
// REJECT HOSPITAL REGISTRATION
// ===============================

app.put("/api/hospital-registration/:id/reject", (req, res) => {
  const registrationId = req.params.id;

  const sql = `
    UPDATE hospital_registration_requests
    SET status = 'REJECTED'
    WHERE registration_id = ? AND status = 'PENDING'
  `;

  db.query(sql, [registrationId], (error, result) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to reject hospital registration.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pending hospital registration not found.",
      });
    }

    res.json({
      message: "Hospital registration rejected successfully.",
    });
  });
});

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("SmartCare Backend is Running!");
});

// ===============================
// SIGN UP API
// ===============================

app.post("/api/signup", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required.",
    });
  }

  const checkSql =
    "SELECT patient_id FROM patients WHERE email = ?";

  db.query(checkSql, [email], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    const sql = `
      INSERT INTO patients
      (name, email, phone, password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name.trim(), email.trim(), phone || "", password],
      (error, result) => {
        if (error) {
          console.error(error);

          return res.status(500).json({
            message: "Registration failed.",
          });
        }

        res.status(201).json({
          message: "Registration successful!",
          patient_id: result.insertId,
        });
      }
    );
  });
});

// ===============================
// ADMIN LOGIN API
// ===============================

app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Admin ID and password are required.",
    });
  }

  const sql = `
    SELECT admin_id, username
    FROM admins
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, password], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid Admin ID or password.",
      });
    }

    res.json({
      message: "Admin login successful.",
      admin: results[0],
    });
  });
});

// ===============================
// LOGIN API
// ===============================

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT patient_id, name, email
    FROM patients
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: results[0],
    });
  });
});

// ===============================
// HOSPITAL LOGIN API
// ===============================

app.post("/api/hospital-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  const sql = `
    SELECT
      hu.hospital_user_id,
      hu.email,
      h.hospital_id,
      h.name AS hospital_name
    FROM hospital_users hu
    JOIN hospitals h
      ON hu.hospital_id = h.hospital_id
    WHERE hu.email = ? AND hu.password = ?
  `;

  db.query(sql, [email, password], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid hospital email or password",
      });
    }

    res.json({
      message: "Hospital login successful",
      hospital: results[0],
    });
  });
});

// ===============================
// GET HOSPITALS
// ===============================

app.get("/api/hospitals", (req, res) => {
  const sql = `
    SELECT
      h.hospital_id,
      h.name,
      h.address,
      h.phone,
      h.latitude,
      h.longitude,

      COALESCE(hs.general_available, 0) AS general,
      COALESCE(hs.icu_available, 0) AS icu,
      COALESCE(hs.emergency_available, 0) AS emergency,
      COALESCE(hs.queue_count, 0) AS queueCount,

      COALESCE(hs.status_mode, 'DEMO') AS statusMode,
      COALESCE(hs.data_source, 'Hospital Dashboard') AS dataSource,
      hs.updated_at AS statusUpdatedAt

    FROM hospitals h

    LEFT JOIN hospital_status hs
      ON h.hospital_id = hs.hospital_id

    ORDER BY h.name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospitals.",
      });
    }

    res.json(results);
  });
});

// ===============================
// EMERGENCY HOSPITALS
// ===============================

app.get("/api/emergency-hospitals", (req, res) => {
  const sql = `
    SELECT
      h.hospital_id,
      h.name,
      h.address,
      h.phone,
      h.latitude,
      h.longitude,
      COALESCE(hs.general_available, 0) AS general_available,
      COALESCE(hs.icu_available, 0) AS icu_available,
      COALESCE(hs.emergency_available, 0) AS emergency_available,
      COALESCE(hs.queue_count, 0) AS queue_count,
      COALESCE(hs.status_mode, 'DEMO') AS status_mode,
      hs.updated_at
    FROM hospitals h
    LEFT JOIN hospital_status hs
      ON h.hospital_id = hs.hospital_id
    ORDER BY icu_available DESC, h.name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch emergency hospitals.",
      });
    }

    res.json(results);
  });
});

// ===============================
// UPDATE HOSPITAL STATUS
// ===============================

app.put("/api/hospital-status/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;

  const {
    general_available,
    icu_available,
    emergency_available,
    queue_count,
  } = req.body;

  if (
    general_available === undefined ||
    icu_available === undefined ||
    emergency_available === undefined ||
    queue_count === undefined
  ) {
    return res.status(400).json({
      message: "Please provide all hospital status details.",
    });
  }

  const sql = `
    UPDATE hospital_status
    SET
      general_available = ?,
      icu_available = ?,
      emergency_available = ?,
      queue_count = ?
    WHERE hospital_id = ?
  `;

  db.query(
    sql,
    [
      general_available,
      icu_available,
      emergency_available,
      queue_count,
      hospitalId,
    ],
    (error, result) => {
      if (error) {
        console.error(error);

        return res.status(500).json({
          message: "Failed to update hospital status.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Hospital status not found.",
        });
      }

      res.json({
        message: "Hospital status updated successfully!",
      });
    }
  );
});
// ===============================
// GET HOSPITAL STATUS
// ===============================

app.get("/api/hospital-status/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;

  const sql = `
    SELECT
      hs.status_id,
      hs.hospital_id,
      h.name AS hospital_name,
      hs.general_available,
      hs.icu_available,
      hs.emergency_available,
      hs.queue_count,
      hs.status_mode,
      hs.data_source,
      hs.updated_at
    FROM hospital_status hs
    JOIN hospitals h
      ON hs.hospital_id = h.hospital_id
    WHERE hs.hospital_id = ?
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospital status.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Hospital status not found.",
      });
    }

    res.json(results[0]);
  });
});

// ===============================
// GET DOCTORS
// ===============================

app.get("/api/doctors", (req, res) => {
  const { hospital_id } = req.query;

  let sql = `
    SELECT
      d.doctor_id AS id,
      d.name,
      d.specialization,
      d.phone,
      d.available,
      d.hospital_id,
      h.name AS hospital,
      s.day_of_week,
      s.start_time,
      s.end_time,
      s.slot_duration
    FROM doctors d
    LEFT JOIN hospitals h
      ON d.hospital_id = h.hospital_id
    LEFT JOIN doctor_schedules s
      ON d.doctor_id = s.doctor_id
  `;

  const params = [];

  if (hospital_id) {
    sql += ` WHERE d.hospital_id = ?`;
    params.push(hospital_id);
  }

  sql += ` ORDER BY d.name, s.day_of_week`;

  db.query(sql, params, (error, rows) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch doctors.",
      });
    }

    // Group schedules under each doctor
    const doctorMap = {};

    rows.forEach((row) => {
      if (!doctorMap[row.id]) {
        doctorMap[row.id] = {
          id: row.id,
          name: row.name,
          specialization: row.specialization,
          phone: row.phone,
          available: row.available,
          hospital_id: row.hospital_id,
          hospital: row.hospital,
          schedules: [],
        };
      }

      if (row.day_of_week) {
        doctorMap[row.id].schedules.push({
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
          slot_duration: row.slot_duration,
        });
      }
    });

    res.json(Object.values(doctorMap));
  });
});
// ===============================
// GENERATE TIME SLOTS
// ===============================

function generateTimeSlots(schedules) {
  const slots = [];

  schedules.forEach((schedule) => {
    const start = timeToMinutes(schedule.start_time);
    const end = timeToMinutes(schedule.end_time);

    const duration = schedule.slot_duration || 30;

    for (
      let current = start;
      current < end;
      current += duration
    ) {
      slots.push(minutesToTime(current));
    }
  });

  return [...new Set(slots)];
}

// ===============================
// TIME HELPER
// ===============================

function timeToMinutes(time) {
  if (typeof time === "string") {
    const parts = time.split(":");

    return (
      Number(parts[0]) * 60 +
      Number(parts[1])
    );
  }

  return 0;
}

// ===============================
// CONVERT MINUTES TO 12-HOUR TIME
// ===============================

function minutesToTime(minutes) {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours >= 12 ? "PM" : "AM";

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${String(mins).padStart(
    2,
    "0"
  )} ${period}`;
}

// ===============================
// BOOK APPOINTMENT
// ===============================

app.post("/api/appointments", (req, res) => {
  const {
    patientName,
    patientEmail,
    hospital,
    doctorId,
    timeSlot,
    date,
  } = req.body;

  if (
    !patientName ||
    !hospital ||
    !doctorId ||
    !timeSlot ||
    !date
  ) {
    return res.status(400).json({
      message: "Please provide all appointment details.",
    });
  }

  // Find patient
  const patientSql = patientEmail
    ? `
      SELECT patient_id, name
      FROM patients
      WHERE email = ?
    `
    : `
      SELECT patient_id, name
      FROM patients
      WHERE name = ?
      LIMIT 1
    `;

  const patientValue = patientEmail
    ? patientEmail
    : patientName;

  db.query(
    patientSql,
    [patientValue],
    (patientError, patientResults) => {
      if (patientError) {
        console.error(patientError);

        return res.status(500).json({
          message: "Database error while finding patient.",
        });
      }

      if (patientResults.length === 0) {
        return res.status(404).json({
          message:
            "Patient account not found. Please login again.",
        });
      }

      const patientId =
        patientResults[0].patient_id;

      // Find hospital
      const hospitalSql = `
        SELECT hospital_id
        FROM hospitals
        WHERE name = ?
        LIMIT 1
      `;

      db.query(
        hospitalSql,
        [hospital],
        (hospitalError, hospitalResults) => {
          if (hospitalError) {
            console.error(hospitalError);

            return res.status(500).json({
              message:
                "Database error while finding hospital.",
            });
          }

          if (hospitalResults.length === 0) {
            return res.status(404).json({
              message: "Hospital not found.",
            });
          }

          const hospitalId =
            hospitalResults[0].hospital_id;

          // Convert selected time
          const mysqlTime =
            convertToMySQLTime(timeSlot);

          if (!mysqlTime) {
            return res.status(400).json({
              message: "Invalid appointment time.",
            });
          }

          // Check doctor
          const doctorSql = `
            SELECT doctor_id
            FROM doctors
            WHERE doctor_id = ?
              AND hospital_id = ?
          `;

          db.query(
            doctorSql,
            [doctorId, hospitalId],
            (doctorError, doctorResults) => {
              if (doctorError) {
                console.error(doctorError);

                return res.status(500).json({
                  message:
                    "Database error while finding doctor.",
                });
              }

              if (doctorResults.length === 0) {
                return res.status(404).json({
                  message:
                    "Doctor not found for this hospital.",
                });
              }

              // Check duplicate appointment
              const duplicateSql = `
                SELECT appointment_id
                FROM appointments
                WHERE doctor_id = ?
                  AND appointment_date = ?
                  AND appointment_time = ?
                  AND status != 'Cancelled'
                LIMIT 1
              `;

              db.query(
                duplicateSql,
                [
                  doctorId,
                  date,
                  mysqlTime,
                ],
                (duplicateError, duplicateResults) => {
                  if (duplicateError) {
                    console.error(
                      duplicateError
                    );

                    return res.status(500).json({
                      message:
                        "Database error while checking slot.",
                    });
                  }

                  if (duplicateResults.length > 0) {
                    return res.status(409).json({
                      message:
                        "This time slot is already booked.",
                    });
                  }

                  // Insert appointment
                  const insertSql = `
                    INSERT INTO appointments
                    (
                      patient_id,
                      doctor_id,
                      hospital_id,
                      appointment_date,
                      appointment_time,
                      priority,
                      status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                  `;

                  db.query(
                    insertSql,
                    [
                      patientId,
                      doctorId,
                      hospitalId,
                      date,
                      mysqlTime,
                      "Normal",
                      "Pending",
                    ],
                    (insertError, result) => {
                      if (insertError) {
                        console.error(
                          insertError
                        );

                        return res.status(500).json({
                          message:
                            "Failed to create appointment.",
                        });
                      }

                      res.status(201).json({
                        message:
                          "Appointment booked successfully!",
                        appointment_id:
                          result.insertId,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});
// ===============================
// GET HOSPITAL APPOINTMENTS
// ===============================

app.get("/api/hospital-appointments/:hospitalId", (req, res) => {
  const { hospitalId } = req.params;

  const sql = `
    SELECT
      a.appointment_id,
      p.name AS patient_name,
      p.email AS patient_email,
      d.name AS doctor_name,
      d.specialization,
      a.appointment_date,
      a.appointment_time,
      a.priority,
      a.status
    FROM appointments a
    JOIN patients p
      ON a.patient_id = p.patient_id
    JOIN doctors d
      ON a.doctor_id = d.doctor_id
    WHERE a.hospital_id = ?
    ORDER BY a.appointment_date, a.appointment_time
  `;

  db.query(sql, [hospitalId], (error, appointments) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospital appointments.",
      });
    }

    res.json(appointments);
  });
});


// ===============================
// UPDATE APPOINTMENT STATUS
// ===============================

app.put("/api/appointments/:appointmentId/status", (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "Pending",
    "Accepted",
    "Rejected",
    "Cancelled",
    "Completed",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid appointment status.",
    });
  }

  const sql = `
    UPDATE appointments
    SET status = ?
    WHERE appointment_id = ?
  `;

  db.query(
    sql,
    [status, appointmentId],
    (error, result) => {
      if (error) {
        console.error(
          "Update Appointment Status Error:",
          error
        );

        return res.status(500).json({
          message: "Failed to update appointment status.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Appointment not found.",
        });
      }

      res.json({
        message: `Appointment ${status.toLowerCase()} successfully.`,
      });
    }
  );
});
// ===============================
// CONVERT 12-HOUR TIME TO MYSQL TIME
// ===============================

function convertToMySQLTime(time) {
  if (!time) {
    return null;
  }

  const match = time.match(
    /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i
  );

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hours < 1 || hours > 12) {
    return null;
  }

  if (minutes < 0 || minutes > 59) {
    return null;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
}

// ===============================
// ML PREDICTED WAITING TIME
// ===============================

const { spawn } = require("child_process");

app.get("/api/hospital-waiting-time/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;

  const sql = `
    SELECT
      queue_count
    FROM hospital_status
    WHERE hospital_id = ?
  `;

  db.query(sql, [hospitalId], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch hospital queue.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Hospital status not found.",
      });
    }

    const queueCount = results[0].queue_count;

    // If nobody is waiting, waiting time is 0
    if (queueCount === 0) {
      return res.json({
        hospital_id: Number(hospitalId),
        queue_count: 0,
        predicted_waiting_minutes: 0,
        prediction_method: "Rule-based (No Queue)",
      });
    }

    // Values used by the trained ML model
    const priority = "Normal";
    const avgConsultationMinutes = 15;
    const timeOfDay = "Morning";

    // Run Python ML model
    const python = spawn("python3", [
      "ml/predict_waiting_time.py",
      queueCount.toString(),
      priority,
      avgConsultationMinutes.toString(),
      timeOfDay,
    ]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python ML Error:", errorOutput);

        return res.status(500).json({
          message: "ML prediction failed.",
        });
      }

      const predictedWaitingMinutes = Number(output.trim());

      res.json({
        hospital_id: Number(hospitalId),
        queue_count: queueCount,
        predicted_waiting_minutes: predictedWaitingMinutes,
        prediction_method: "Random Forest ML",
      });
    });
  });
});

// ===============================
// AI BED / ICU DEMAND PREDICTION
// ===============================

app.get("/api/bed-demand/:hospitalId", (req, res) => {
  const hospitalId = Number(req.params.hospitalId);

  if (!hospitalId) {
    return res.status(400).json({
      message: "Invalid hospital ID.",
    });
  }

  // Predict for the next day
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayOfWeek =
    tomorrow.getDay() === 0
      ? 7
      : tomorrow.getDay();

  const python = spawn("python3", [
    "ml/predict_bed_demand.py",
    hospitalId.toString(),
    dayOfWeek.toString(),
  ]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error("Bed Demand ML Error:", errorOutput);

      return res.status(500).json({
        message: "Bed demand prediction failed.",
      });
    }

    const predictedDemand = Number(output.trim());

    res.json({
      hospital_id: hospitalId,
      predicted_icu_demand: Math.round(predictedDemand),
      prediction_method: "Random Forest ML",
      prediction_for: "Next Day",
    });
  });
});


// ===============================
// AI ICU DEMAND - 7 DAY FORECAST
// ===============================

app.get("/api/bed-demand-forecast/:hospitalId", async (req, res) => {
  const hospitalId = Number(req.params.hospitalId);

  if (!hospitalId) {
    return res.status(400).json({
      message: "Invalid hospital ID.",
    });
  }

  const predictions = [];

  try {
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Sunday = 0, convert to Monday = 1 ... Sunday = 7
      const dayOfWeek =
        date.getDay() === 0
          ? 7
          : date.getDay();

      const prediction = await new Promise((resolve, reject) => {
        const python = spawn("python3", [
          "ml/predict_bed_demand.py",
          hospitalId.toString(),
          dayOfWeek.toString(),
        ]);

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {
          output += data.toString();
        });

        python.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        python.on("close", (code) => {
          if (code !== 0) {
            console.error("Bed Demand ML Error:", errorOutput);
            reject(new Error("ML prediction failed."));
            return;
          }

          resolve(Number(output.trim()));
        });
      });

      predictions.push({
        date: date.toISOString().split("T")[0],
        predicted_icu_demand: Math.round(prediction),
      });
    }

    res.json({
      hospital_id: hospitalId,
      prediction_method: "Random Forest ML",
      forecast_period: "Next 7 Days",
      predictions,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate ICU demand forecast.",
    });
  }
});
// ===============================
// AI HEALTH ASSISTANT
// ===============================

app.post("/api/ai-assistant", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      message: "Please enter a health-related question.",
    });
  }

  try {
    const prompt = `
You are SmartCare's AI Health Assistant.

Your role is to provide general health information and guidance.
You are NOT a doctor and must not provide a definitive diagnosis.

Rules:
- Give clear, simple and helpful answers.
- Do not claim to know live hospital availability unless that data is provided.
- Do not prescribe medicines or give exact medical treatment instructions.
- If symptoms could indicate an emergency, advise the user to seek immediate emergency medical care.
- Encourage the user to consult a qualified healthcare professional when appropriate.
- Keep answers concise.

User question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({
      reply: response,
    });
  } catch (error) {
    console.error("Gemini AI Error:", error);

    res.status(500).json({
      message: "AI Assistant is temporarily unavailable.",
    });
  }
});

// ===============================
// ADD DOCTOR
// ===============================

app.post("/api/doctors", (req, res) => {
  const {
    name,
    specialization,
    phone,
    hospital_id,
    schedules,
  } = req.body;
  console.log("Received schedules:", schedules);

  if (!name || !specialization || !hospital_id) {
    return res.status(400).json({
      message: "Name, specialization and hospital are required.",
    });
  }

  const doctorSql = `
    INSERT INTO doctors
    (name, specialization, phone, hospital_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    doctorSql,
    [name, specialization, phone || null, hospital_id],
    (error, result) => {
      if (error) {
        console.error("Add Doctor Error:", error);

        return res.status(500).json({
          message: "Failed to add doctor.",
        });
      }

      const doctorId = result.insertId;

      // Save doctor schedules
      if (Array.isArray(schedules) && schedules.length > 0) {
        const scheduleSql = `
          INSERT INTO doctor_schedules
          (doctor_id, day_of_week, start_time, end_time, slot_duration)
          VALUES ?
        `;

        const scheduleValues = schedules.map((schedule) => [
          doctorId,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.slot_duration || 30,
        ]);

        db.query(
          scheduleSql,
          [scheduleValues],
          (scheduleError) => {
            if (scheduleError) {
              console.error("Add Schedule Error:", scheduleError);

              return res.status(500).json({
                message: "Doctor added, but schedule could not be saved.",
                doctor_id: doctorId,
              });
            }

            res.status(201).json({
              message: "Doctor and schedule added successfully.",
              doctor_id: doctorId,
            });
          }
        );
      } else {
        res.status(201).json({
          message: "Doctor added successfully.",
          doctor_id: doctorId,
        });
      }
    }
  );
});

// ===============================
// START SERVER
// ===============================

app.listen(5001, () => {
  console.log(
    "Server running on http://localhost:5001"
  );
});
