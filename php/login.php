<?php
// Get the form data
$email = $_POST['email'];
$password = $_POST['password'];

// Connect to the database
$conn = new mysqli("localhost", "root", "", "test");

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Prepare and execute the select statement
$stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
  // Check if the password matches
  $row = $result->fetch_assoc();
  if (password_verify($password, $row['password'])) {
    echo "Login successful.";
    //echo '<script>alert("Login successful. Now you contine browsing")</script>';
    header("Location: ../index.html");
  } else {
    echo "Invalid password.";
    //echo '<script>alert("Invalid pasword.)</script>';
    header("Location: ../login_signup.html");
  }
} else {
  echo "User not found.";
  //echo '<script>alert("User not found. ")</script>';
  header("Location: ../login_signup.html");
}

$stmt->close();
$conn->close();
?>
