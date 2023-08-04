<?php
// Get the form data
$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Connect to the database
$conn = new mysqli("localhost", "root", null, "test");

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Prepare and execute the insert statement
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
  echo "Sign up successful.";
  //echo '<script>alert("Sign up successful. Now you can login")</script>';
  header("Location: ../login_signup.html");
} else {
  echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();

?>
