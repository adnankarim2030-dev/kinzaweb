<?php
/**
 * Kinza Web - Automated Hostinger Zip Extraction Tool
 * Bypasses Hostinger File Manager 429 Rate Limit Errors
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$zipFile = __DIR__ . '/kinzaweb_deploy.zip';

if (!file_exists($zipFile)) {
    die("<h2 style='color:red;font-family:sans-serif;'>❌ File kinzaweb_deploy.zip not found in public_html! Please ensure kinzaweb_deploy.zip is present.</h2>");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo(__DIR__);
    $zip->close();
    echo "<div style='font-family:sans-serif;padding:30px;background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;max-width:600px;margin:50px auto;text-align:center;'>
        <h1 style='color:#15803d;margin-0;'>🎉 EXTRACTION SUCCESSFUL!</h1>
        <p style='color:#166534;font-size:18px;'>All website files have been extracted cleanly to <strong>public_html</strong>.</p>
        <p style='color:#374151;'>You can now open <a href='https://kinzapk.com/' style='color:#2563eb;font-weight:bold;'>https://kinzapk.com/</a> to view your updated website!</p>
    </div>";
} else {
    echo "<h2 style='color:red;font-family:sans-serif;'>❌ Error: Could not open kinzaweb_deploy.zip for extraction.</h2>";
}
?>
