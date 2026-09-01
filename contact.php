<?php
/**
 * Contact form handler for gameodyssey.com.
 *
 * Runs on Hostinger shared hosting (PHP 7.4+ / 8.x) using the built-in mail()
 * transport. Hostinger delivers mail() reliably only when the From address is
 * a mailbox on the site's own domain, so we send from noreply@<domain> and put
 * the visitor's address in Reply-To.
 *
 * Redirects back to contact.html with ?sent=1 or ?error=<reason>.
 */

declare(strict_types=1);

// ---- Configuration ---------------------------------------------------------
const RECIPIENT      = 'info@gameodyssey.com';   // where enquiries are delivered
const SUBJECT_PREFIX = '[GameOdyssey contact] ';
const MIN_SECONDS    = 4;                        // forms filled faster than this are bots
const MAX_MESSAGE    = 5000;
// ----------------------------------------------------------------------------

function back(string $query): void
{
    header('Location: contact.html?' . $query, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Location: contact.html', true, 303);
    exit;
}

$field = static function (string $key, int $max): string {
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    // Strip control characters (prevents header injection) and cap length.
    $v = preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
};

// Honeypot: real browsers leave the hidden "website" field empty.
if ($field('website', 50) !== '') {
    back('spam=1&error=spam');
}

// Timing check: the page stamps a millisecond timestamp when it loads.
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (time() * 1000 - $ts) < MIN_SECONDS * 1000) {
    back('error=spam');
}

$name    = $field('name', 100);
$email   = $field('email', 200);
$subject = $field('subject', 150);
$message = $field('message', MAX_MESSAGE);

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    back('error=invalid');
}

// Strip newlines from anything that goes into a header.
$name    = str_replace(["\r", "\n"], ' ', $name);
$subject = str_replace(["\r", "\n"], ' ', $subject);

$host = preg_replace('/^www\./i', '', $_SERVER['HTTP_HOST'] ?? 'gameodyssey.com');
$host = preg_replace('/[^a-z0-9.\-]/i', '', $host) ?: 'gameodyssey.com';
$from = 'noreply@' . $host;

$encodedSubject = '=?UTF-8?B?' . base64_encode(SUBJECT_PREFIX . $subject) . '?=';
$encodedName    = '=?UTF-8?B?' . base64_encode($name) . '?=';

$body  = "New message from the GameOdyssey contact form\n";
$body .= str_repeat('-', 46) . "\n";
$body .= "Name:    {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Subject: {$subject}\n";
$body .= "IP:      " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";
$body .= "Time:    " . gmdate('Y-m-d H:i:s') . " UTC\n";
$body .= str_repeat('-', 46) . "\n\n";
$body .= $message . "\n";

$headers = [
    'From: ' . $encodedName . ' <' . $from . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = @mail(RECIPIENT, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $from);

back($sent ? 'sent=1' : 'error=mail');
