<?php
// 检查是否是 POST 请求
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. 获取最新 index.html 表单里的真实数据
    $name    = htmlspecialchars(trim($_POST['name']));
    $email   = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars(trim($_POST['subject']));
    $message = htmlspecialchars(trim($_POST['message']));

    // 2. 设置接收邮箱
    $to = "jackie.jo@mdhichina.com"; 
    
    // 3. 邮件的主题
    $email_subject = "New Inquiry from MEEM Website: " . ($subject ? $subject : $name);
    
    // 4. 邮件的正文内容
    $email_content  = "You have received a new message from the MEEM website contact form.\n\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Subject: $subject\n\n";
    $email_content .= "Message:\n$message\n";
    
    // 5. 邮件头信息
    $headers  = "From: no-reply@yourwebsite.com\r\n"; // 建议上线后改成你们的同域邮箱
    $headers .= "Reply-To: $email\r\n";

    // 6. 发送邮件并返回结果
    if (mail($to, $email_subject, $email_content, $headers)) {
        // 发送成功，提示并跳转回首页
        echo "<script>alert('Thank you! Your message has been sent successfully.'); window.location.href='index.html';</script>";
    } else {
        // 发送失败
        echo "<script>alert('Oops! Something went wrong, and we couldn\'t send your message.'); window.history.back();</script>";
    }
} else {
    // 踢回首页
    header("Location: index.html");
    exit;
}
?>