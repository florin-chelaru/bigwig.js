<?php
/**
 * Created by PhpStorm.
 * User: florinc
 * Date: 9/30/2015
 * Time: 4:10 PM
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Range');

$file_uri = $_GET['q'];
if (!$file_uri) { exit; }

$range = $_GET['r'];
if (!$range) { exit; }

$url = $file_uri;
$resource = curl_init();
curl_setopt($resource, CURLOPT_URL, $url);
curl_setopt($resource, CURLOPT_RANGE, $range);
curl_setopt($resource, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($resource, CURLOPT_BINARYTRANSFER, 1);
$response = curl_exec($resource);
curl_close($resource);

echo $response;
