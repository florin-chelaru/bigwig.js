<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Range');

if (!isset($_SERVER['HTTP_RANGE'])) {
  exit;
}

$file_uri = $_GET['q'];

if (!$file_uri) { exit; }

$url = $file_uri;
$headers = getallheaders();
$resource = curl_init();
curl_setopt($resource, CURLOPT_URL, $url);
curl_setopt($resource, CURLOPT_HTTPHEADER, array('Range: '.$headers['Range']));
//curl_setopt($resource, CURLOPT_RETURNTRANSFER, 1);
echo curl_exec($resource);
curl_close($resource);

