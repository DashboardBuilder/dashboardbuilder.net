<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>File New</title>  
</head>
<body>

<?php 

$newfile = 'data'.DIRECTORY_SEPARATOR.'data.xml';
$file = 'data'.DIRECTORY_SEPARATOR.'empty'.DIRECTORY_SEPARATOR.'data.xml';

if (!copy($file, $newfile)) {
    echo "failed to copy $file...\n";
}
header('Location: ' . $_SERVER["HTTP_REFERER"] );
?>
