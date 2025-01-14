<?php
require 'razorpay-php-master/razorpay-php-master/Razorpay.php'; // Include Razorpay PHP library

use Razorpay\Api\Api;

// Razorpay API Key and Secret
$key_id = 'conf';
$key_secret = 'conf';

// Collect user details from the form (this will be empty initially, will be filled after form submission)
$name = '';
$email = '';
$address = '';
$product = '';
$amount = 0;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Collect data from form submission
    $name = $_POST['name'];
    $email = $_POST['email'];
    $address = $_POST['address'];
    $product = $_POST['product'];
    $amount = $_POST['amount'] * 100; // Amount in paise (for Razorpay)

    // Initialize Razorpay API
    $api = new Api($key_id, $key_secret);

    // Create an order
    $order = $api->order->create([
        'receipt' => uniqid(),
        'amount' => $amount,
        'currency' => 'INR',
    ]);

    $order_id = $order['id'];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Form</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <h1>Complete Your Payment</h1>
    <!-- Display form if not submitted yet -->
    <?php if ($_SERVER['REQUEST_METHOD'] != 'POST') { ?>
        <form method="POST" action="">
            <label>Name:</label><br>
            <input type="text" name="name" required><br><br>

            <label>Email:</label><br>
            <input type="email" name="email" required><br><br>

            <label>Address:</label><br>
            <input type="text" name="address" required><br><br>

            <label>Product:</label><br>
            <input type="text" name="product" required><br><br>

            <label>Amount (INR):</label><br>
            <input type="number" name="amount" required><br><br>

            <button type="submit">Proceed to Payment</button>
        </form>
    <?php } else { ?>
        <!-- Razorpay Checkout Script to complete payment -->
        <script>
            const options = {
                "key": "<?php echo $key_id; ?>",
                "amount": "<?php echo $amount; ?>",
                "currency": "INR",
                "name": "<?php echo $name; ?>",
                "description": "<?php echo $product; ?>",
                "order_id": "<?php echo $order_id; ?>",
                "handler": function (response) {
                    alert("Payment Successful!");
                    window.location.href = "success.php?payment_id=" + response.razorpay_payment_id + 
                                           "&order_id=" + response.razorpay_order_id +
                                           "&email=<?php echo $email; ?>";
                },
                "prefill": {
                    "name": "<?php echo $name; ?>",
                    "email": "<?php echo $email; ?>"
                },
                "theme": {
                    "color": "#F37254"
                }
            };
            const rzp = new Razorpay(options);
            rzp.open();
        </script>
    <?php } ?>
</body>
</html>
