<?php
require 'razorpay-php-master/razorpay-php-master/Razorpay.php';  // Include Razorpay PHP library

use Razorpay\Api\Api;

// Razorpay API Key and Secret
$key_id = 'rzp_test_rfE6atTZ7KOEqv';
$key_secret = 'uV4YwT9b1srb7mEM6Lmi6Gt2';

// Retrieve payment details from Razorpay response
$payment_id = $_GET['payment_id'];
$order_id = $_GET['order_id'];
$email = $_GET['email'];

$api = new Api($key_id, $key_secret);

try {
    // Fetch the payment details from Razorpay
    $payment = $api->payment->fetch($payment_id);

    if ($payment->status == 'captured') {
        // Payment was successful, send success email
        $subject = "Payment Successful!";
        $message = "Dear customer,\n\nYour payment for Order ID: $order_id was successful.\n\nThank you for your purchase!";
        $headers = "From: no-reply@yourwebsite.com";

        if (mail($email, $subject, $message, $headers)) {
            echo "Payment Successful! Confirmation email sent.";
        } else {
            echo "Payment Successful, but email could not be sent.";
        }
    } else {
        // Payment failed, send failure email
        $subject = "Payment Failed";
        $message = "Dear customer,\n\nUnfortunately, your payment for Order ID: $order_id failed. Please try again.";
        $headers = "From: no-reply@yourwebsite.com";

        if (mail($email, $subject, $message, $headers)) {
            echo "Payment failed, failure email sent.";
        } else {
            echo "Payment failed, but email could not be sent.";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
