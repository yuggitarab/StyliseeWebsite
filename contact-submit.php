<?php
declare(strict_types=1);

// Executed by cPanel PHP, never served as a static Vite asset.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => $status === 200, 'message' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Please submit the contact form to send an enquiry.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://stylisee.com', 'https://www.stylisee.com'], true)) {
    respond(403, 'Please send your enquiry from the Stylisee website.');
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
    respond(403, 'Please send your enquiry from the Stylisee website.');
}
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
    respond(415, 'Please use the contact form to send your enquiry.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) {
    respond(413, 'Your enquiry is too long. Please shorten your message.');
}
$raw = file_get_contents('php://input', false, null, 0, 12001);
if ($raw === false || strlen($raw) > 12000) {
    respond(413, 'Your enquiry is too long. Please shorten your message.');
}
$input = json_decode($raw, true);
if (!is_array($input)) {
    respond(400, 'Please check your enquiry and try again.');
}

foreach (['name', 'email', 'subject', 'message'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field]) || trim($input[$field]) === '') {
        respond(422, 'Please fill in all required fields.');
    }
}
$name = trim($input['name']);
$email = trim($input['email']);
$subject = trim($input['subject']);
$message = trim($input['message']);
if (strlen($name) > 160 || strlen($email) > 254 || strlen($message) > 6000) {
    respond(422, 'Please shorten your name or message and try again.');
}
if (preg_match('/[\r\n\x00]/', $name . $email . $subject) || strpos($message, "\0") !== false) {
    respond(422, 'Please check your name, email address and message.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Please enter a valid email address.');
}
if (!in_array($subject, ['Tell me about Stylisee', 'Plans and billing', 'Partnership enquiry', 'Something else'], true)) {
    respond(422, 'Please select a topic for your enquiry.');
}
if (isset($input['website']) && (!is_string($input['website']) || trim($input['website']) !== '')) {
    respond(422, 'Your enquiry could not be submitted. Please email support@stylisee.com directly.');
}

// Keep only timestamps, not enquiry content, in a private temporary rate-limit directory.
// Never trust client-controlled X-Forwarded-For for this limit.
$rateDirectory = sys_get_temp_dir() . '/stylisee-contact-' . hash('sha256', __DIR__);
if (!is_dir($rateDirectory) && !@mkdir($rateDirectory, 0700, true) && !is_dir($rateDirectory)) {
    error_log('Stylisee contact: rate-limit directory unavailable.');
    respond(503, 'We could not send your enquiry. Please email support@stylisee.com directly.');
}
$rateFile = $rateDirectory . '/' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.json';
$lock = @fopen($rateFile, 'c+');
if ($lock === false || !flock($lock, LOCK_EX)) {
    error_log('Stylisee contact: rate-limit lock unavailable.');
    respond(503, 'We could not send your enquiry. Please email support@stylisee.com directly.');
}
@chmod($rateFile, 0600);
$now = time();
$previous = json_decode(stream_get_contents($lock), true);
$attempts = array_values(array_filter(is_array($previous) ? $previous : [], static function ($time) use ($now): bool {
    return is_int($time) && $time > $now - 3600;
}));
if (count($attempts) >= 5) {
    flock($lock, LOCK_UN);
    fclose($lock);
    header('Retry-After: 3600');
    respond(429, 'You have sent several enquiries recently. Please try again later or email support@stylisee.com.');
}
$attempts[] = $now;
rewind($lock);
ftruncate($lock, 0);
$saved = fwrite($lock, json_encode($attempts)) !== false && fflush($lock);
flock($lock, LOCK_UN);
fclose($lock);
if (!$saved) {
    error_log('Stylisee contact: rate-limit write failed.');
    respond(503, 'We could not send your enquiry. Please email support@stylisee.com directly.');
}

$body = "New Stylisee website enquiry\n\nName: {$name}\nEmail: {$email}\nTopic: {$subject}\n\n"
    . str_replace(["\r\n", "\r"], "\n", $message) . "\n";
$headers = [
    'From: Stylisee Website <support@stylisee.com>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
];
$mailSubject = '=?UTF-8?B?' . base64_encode('[Stylisee enquiry] ' . $subject) . '?=';
$accepted = is_callable('mail') && @mail(
    'support@stylisee.com',
    $mailSubject,
    quoted_printable_encode($body),
    implode("\r\n", $headers)
);
if (!$accepted) {
    error_log('Stylisee contact: hosting mail service did not accept the enquiry.');
    respond(503, 'We could not send your enquiry. Please try again later or email support@stylisee.com directly.');
}

// mail() confirms acceptance by the host, not delivery to the recipient's inbox.
respond(200, 'Thank you for your enquiry. We will get back to you within two working days.');