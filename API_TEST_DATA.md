# 📚 API Test Data - Assignment & StudentAssignment

## 🔐 Authentication
Tất cả các API đều cần token JWT trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 ASSIGNMENT APIs

### 1. POST /api/assignments - Tạo bài tập mới
**Role:** Teacher/Admin

**Request Body:**
```json
{
  "class_id": "507f1f77bcf86cd799439011",
  "code": "BT0001",
  "title": "Bài tập về nhà - Toán học tuần 1",
  "description": "Làm bài tập SGK trang 45-50. Giải các bài tập về phương trình bậc 2 và hệ phương trình.",
  "subject_id": "507f1f77bcf86cd799439012",
  "due_date": "2025-12-31T23:59:59.000Z",
  "max_score": 10,
  "passing_score": 5,
  "attachments": [
    {
      "filename": "bai_tap_toan.pdf",
      "url": "https://example.com/files/bai_tap_toan.pdf",
      "size": 1024000,
      "type": "application/pdf"
    }
  ],
  "auto_grade_enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo bài tập thành công",
  "data": {
    "class_id": "507f1f77bcf86cd799439011",
    "code": "BT0001",
    "title": "Bài tập về nhà - Toán học tuần 1",
    "description": "Làm bài tập SGK trang 45-50...",
    "subject_id": "507f1f77bcf86cd799439012",
    "due_date": "2025-12-31T23:59:59.000Z",
    "max_score": 10,
    "passing_score": 5,
    "total_submitted": 0,
    "total_unsubmitted": 35,
    "attachments": [...],
    "auto_grade_enabled": false,
    "created_at": "2025-11-19T10:00:00.000Z",
    "updated_at": "2025-11-19T10:00:00.000Z"
  }
}
```

### 2. GET /api/assignments - Lấy tất cả bài tập
**Role:** Teacher/Admin/Student

**Query Params:**
```
page=1
limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bài tập thành công",
  "data": {
    "assignments": [
      {
        "code": "BT0001",
        "title": "Bài tập về nhà - Toán học tuần 1",
        "class_id": {
          "name": "Lớp 10A1",
          "code": "10A1"
        },
        "subject_id": {
          "name": "Toán học",
          "code": "TOAN"
        },
        "due_date": "2025-12-31T23:59:59.000Z",
        "max_score": 10,
        "total_submitted": 20,
        "total_unsubmitted": 15
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 3. GET /api/assignments/:assignmentId - Lấy bài tập theo ID
**Role:** Teacher/Admin/Student

**URL:**
```
GET /api/assignments/507f1f77bcf86cd799439013
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin bài tập thành công",
  "data": {
    "code": "BT0001",
    "title": "Bài tập về nhà - Toán học tuần 1",
    "description": "Làm bài tập SGK trang 45-50...",
    "class_id": {
      "name": "Lớp 10A1",
      "code": "10A1"
    },
    "subject_id": {
      "name": "Toán học",
      "code": "TOAN"
    },
    "due_date": "2025-12-31T23:59:59.000Z",
    "max_score": 10,
    "passing_score": 5,
    "total_submitted": 20,
    "total_unsubmitted": 15,
    "attachments": [
      {
        "filename": "bai_tap_toan.pdf",
        "url": "https://example.com/files/bai_tap_toan.pdf",
        "size": 1024000,
        "type": "application/pdf"
      }
    ],
    "completion_rate": 57,
    "days_until_due": 42
  }
}
```

### 4. GET /api/assignments/class - Lấy bài tập theo lớp
**Role:** Teacher/Admin/Student

**Query Params:**
```
classId=507f1f77bcf86cd799439011
page=1
limit=20
```

**Response:** (Tương tự GET all assignments)

### 5. GET /api/assignments/subject - Lấy bài tập theo môn học
**Role:** Teacher/Admin/Student

**Query Params:**
```
subjectId=507f1f77bcf86cd799439012
page=1
limit=20
```

### 6. GET /api/assignments/upcoming - Bài tập sắp đến hạn
**Role:** Teacher/Admin/Student

**Query Params:**
```
classId=507f1f77bcf86cd799439011
days=7
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bài tập sắp đến hạn thành công",
  "data": [
    {
      "code": "BT0002",
      "title": "Bài kiểm tra giữa kỳ",
      "due_date": "2025-11-25T23:59:59.000Z",
      "days_until_due": 6
    }
  ]
}
```

### 7. GET /api/assignments/past-due - Bài tập quá hạn
**Role:** Teacher/Admin/Student

**Query Params:**
```
classId=507f1f77bcf86cd799439011
```

### 8. GET /api/assignments/:assignmentId/statistics - Thống kê bài tập
**Role:** Teacher/Admin

**URL:**
```
GET /api/assignments/507f1f77bcf86cd799439013/statistics
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê bài tập thành công",
  "data": {
    "assignment": {
      "code": "BT0001",
      "title": "Bài tập về nhà - Toán học tuần 1",
      "max_score": 10,
      "passing_score": 5
    },
    "statistics": {
      "total_students": 35,
      "submitted": 28,
      "not_submitted": 7,
      "graded": 25,
      "late": 3,
      "submission_rate": 80,
      "average_score": 7.2,
      "passed": 22,
      "failed": 3
    }
  }
}
```

### 9. PUT /api/assignments/:assignmentId - Cập nhật bài tập
**Role:** Teacher/Admin

**URL:**
```
PUT /api/assignments/507f1f77bcf86cd799439013
```

**Request Body:**
```json
{
  "title": "Bài tập về nhà - Toán học tuần 1 (Cập nhật)",
  "description": "Bổ sung thêm bài tập SGK trang 51-55",
  "due_date": "2026-01-15T23:59:59.000Z",
  "max_score": 15,
  "passing_score": 8
}
```

### 10. DELETE /api/assignments/:assignmentId - Xóa bài tập
**Role:** Teacher/Admin

**URL:**
```
DELETE /api/assignments/507f1f77bcf86cd799439013
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa bài tập thành công"
}
```

---

## 👨‍🎓 STUDENT ASSIGNMENT APIs

### 1. POST /api/student-assignments - Tạo student assignment thủ công
**Role:** Teacher/Admin

**Request Body:**
```json
{
  "student_id": "507f1f77bcf86cd799439020",
  "assignment_id": "507f1f77bcf86cd799439013",
  "due_date": "2025-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo student assignment thành công",
  "data": {
    "student_id": "507f1f77bcf86cd799439020",
    "assignment_id": "507f1f77bcf86cd799439013",
    "due_date": "2025-12-31T23:59:59.000Z",
    "status": "not_submitted",
    "created_at": "2025-11-19T10:00:00.000Z"
  }
}
```

### 2. GET /api/student-assignments - Lấy tất cả student assignments
**Role:** Teacher/Admin

**Query Params:**
```
page=1
limit=20
```

### 3. GET /api/student-assignments/my-assignments - Bài tập của tôi (Student)
**Role:** Student

**Query Params:**
```
page=1
limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách assignments của bạn thành công",
  "data": {
    "studentAssignments": [
      {
        "assignment_id": {
          "code": "BT0001",
          "title": "Bài tập về nhà - Toán học tuần 1",
          "due_date": "2025-12-31T23:59:59.000Z",
          "max_score": 10
        },
        "status": "not_submitted",
        "due_date": "2025-12-31T23:59:59.000Z",
        "days_until_due": 42
      },
      {
        "assignment_id": {
          "code": "BT0002",
          "title": "Bài kiểm tra giữa kỳ",
          "due_date": "2025-11-25T23:59:59.000Z",
          "max_score": 20
        },
        "status": "submitted",
        "submitted_at": "2025-11-18T14:30:00.000Z",
        "score": 8.5,
        "feedback": "Làm tốt!"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### 4. GET /api/student-assignments/my-unsubmitted - Bài chưa nộp của tôi
**Role:** Student

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bài chưa nộp của bạn thành công",
  "data": [
    {
      "assignment_id": {
        "code": "BT0001",
        "title": "Bài tập về nhà - Toán học tuần 1",
        "due_date": "2025-12-31T23:59:59.000Z"
      },
      "status": "not_submitted",
      "due_date": "2025-12-31T23:59:59.000Z",
      "days_until_due": 42
    }
  ]
}
```

### 5. GET /api/student-assignments/graded-by-me - Bài đã chấm của tôi (Teacher)
**Role:** Teacher

**Query Params:**
```
page=1
limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bài đã chấm thành công",
  "data": {
    "studentAssignments": [
      {
        "student_id": {
          "student_code": "HS001",
          "user_id": "507f1f77bcf86cd799439020"
        },
        "assignment_id": {
          "code": "BT0001",
          "title": "Bài tập về nhà - Toán học tuần 1"
        },
        "score": 8.5,
        "feedback": "Làm tốt, cần cải thiện phần cuối",
        "graded_at": "2025-11-19T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 6. GET /api/student-assignments/submissions - Submissions của bài tập
**Role:** Teacher/Admin

**Query Params:**
```
assignmentId=507f1f77bcf86cd799439013
page=1
limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách submissions thành công",
  "data": {
    "studentAssignments": [
      {
        "student_id": {
          "student_code": "HS001",
          "user_id": {
            "full_name": "Nguyễn Văn A"
          }
        },
        "status": "graded",
        "submitted_at": "2025-11-18T14:30:00.000Z",
        "score": 8.5,
        "submission_file": "https://example.com/submissions/hs001_bt0001.pdf",
        "is_late": false
      },
      {
        "student_id": {
          "student_code": "HS002",
          "user_id": {
            "full_name": "Trần Thị B"
          }
        },
        "status": "late",
        "submitted_at": "2026-01-02T10:00:00.000Z",
        "days_late": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "totalPages": 2
    }
  }
}
```

### 7. GET /api/student-assignments/student/:studentId - Bài tập của học sinh
**Role:** Teacher/Admin

**URL:**
```
GET /api/student-assignments/student/507f1f77bcf86cd799439020?page=1&limit=20
```

### 8. GET /api/student-assignments/student/:studentId/unsubmitted - Bài chưa nộp
**Role:** Teacher/Admin

**URL:**
```
GET /api/student-assignments/student/507f1f77bcf86cd799439020/unsubmitted
```

### 9. GET /api/student-assignments/:studentAssignmentId - Chi tiết
**Role:** Teacher/Admin/Student

**URL:**
```
GET /api/student-assignments/507f1f77bcf86cd799439030
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin student assignment thành công",
  "data": {
    "student_id": {
      "student_code": "HS001"
    },
    "assignment_id": {
      "code": "BT0001",
      "title": "Bài tập về nhà - Toán học tuần 1",
      "max_score": 10,
      "passing_score": 5
    },
    "submission_file": "https://example.com/submissions/hs001_bt0001.pdf",
    "submission_text": "Đây là bài làm của em...",
    "submitted_at": "2025-11-18T14:30:00.000Z",
    "due_date": "2025-12-31T23:59:59.000Z",
    "score": 8.5,
    "feedback": "Làm tốt, cần cải thiện phần cuối",
    "status": "graded",
    "graded_at": "2025-11-19T09:00:00.000Z",
    "graded_by": {
      "teacher_code": "GV001"
    },
    "is_late": false,
    "days_late": 0
  }
}
```

### 10. POST /api/student-assignments/:studentAssignmentId/submit - Nộp bài
**Role:** Student

**URL:**
```
POST /api/student-assignments/507f1f77bcf86cd799439030/submit
```

**Request Body:**
```json
{
  "submission_file": "https://example.com/submissions/hs001_bt0001.pdf",
  "submission_text": "Đây là bài làm của em. Em đã hoàn thành tất cả các câu hỏi trong bài tập."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nộp bài thành công",
  "data": {
    "student_id": "507f1f77bcf86cd799439020",
    "assignment_id": {
      "code": "BT0001",
      "title": "Bài tập về nhà - Toán học tuần 1"
    },
    "submission_file": "https://example.com/submissions/hs001_bt0001.pdf",
    "submission_text": "Đây là bài làm của em...",
    "submitted_at": "2025-11-19T10:30:00.000Z",
    "status": "submitted",
    "is_late": false
  }
}
```

### 11. POST /api/student-assignments/:studentAssignmentId/grade - Chấm điểm
**Role:** Teacher/Admin

**URL:**
```
POST /api/student-assignments/507f1f77bcf86cd799439030/grade
```

**Request Body:**
```json
{
  "score": 8.5,
  "feedback": "Làm tốt! Bài làm của em rất chi tiết và chính xác. Tuy nhiên, ở phần cuối cần giải thích rõ hơn về cách tính."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chấm điểm thành công",
  "data": {
    "student_id": {
      "student_code": "HS001"
    },
    "assignment_id": {
      "code": "BT0001",
      "title": "Bài tập về nhà - Toán học tuần 1",
      "max_score": 10,
      "passing_score": 5
    },
    "score": 8.5,
    "feedback": "Làm tốt! Bài làm của em rất chi tiết...",
    "status": "graded",
    "graded_at": "2025-11-19T11:00:00.000Z",
    "graded_by": {
      "teacher_code": "GV001"
    }
  }
}
```

### 12. PUT /api/student-assignments/:studentAssignmentId - Cập nhật
**Role:** Teacher/Admin

**URL:**
```
PUT /api/student-assignments/507f1f77bcf86cd799439030
```

**Request Body:**
```json
{
  "score": 9.0,
  "feedback": "Sau khi xem lại, em được 9 điểm. Rất tốt!",
  "status": "graded"
}
```

### 13. DELETE /api/student-assignments/:studentAssignmentId - Xóa
**Role:** Teacher/Admin

**URL:**
```
DELETE /api/student-assignments/507f1f77bcf86cd799439030
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa student assignment thành công"
}
```

---

## 📋 Test Scenarios (Postman/Thunder Client)

### Scenario 1: Teacher tạo bài tập và học sinh nộp bài

1. **Teacher login** → Lấy token
2. **POST /api/assignments** → Tạo bài tập mới (tự động tạo StudentAssignments)
3. **GET /api/assignments/:assignmentId/statistics** → Xem thống kê (0 bài đã nộp)
4. **Student login** → Lấy token
5. **GET /api/student-assignments/my-assignments** → Xem bài tập của mình
6. **POST /api/student-assignments/:id/submit** → Nộp bài
7. **Teacher login lại**
8. **GET /api/assignments/:assignmentId/statistics** → Xem thống kê (1 bài đã nộp)
9. **POST /api/student-assignments/:id/grade** → Chấm điểm
10. **GET /api/student-assignments/graded-by-me** → Xem danh sách đã chấm

### Scenario 2: Kiểm tra bài nộp trễ

1. Tạo assignment với `due_date` trong quá khứ
2. Student nộp bài → `status` sẽ là "late"
3. Check `is_late` và `days_late` trong response

### Scenario 3: Quản lý assignments theo class

1. **GET /api/assignments/class?classId=xxx** → Lấy tất cả bài tập của lớp
2. **GET /api/assignments/upcoming?classId=xxx&days=7** → Bài tập sắp đến hạn
3. **GET /api/assignments/past-due?classId=xxx** → Bài tập quá hạn

---

## 🔍 Notes

- Tất cả dates phải ở định dạng ISO8601: `2025-12-31T23:59:59.000Z`
- MongoDB ObjectId phải là 24 ký tự hex
- File attachments cần upload lên server trước và lấy URL
- Score phải từ 0-100 (hoặc 0 đến max_score)
- Assignment code phải theo format: `BT` + 4-6 chữ số (VD: BT0001, BT123456)