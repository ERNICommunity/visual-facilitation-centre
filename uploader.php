<?php

header("Content-Type:application/json");
$path = 'uploads/'; //set foldername
$output = [];
$status = 404;
$message = 'Not Found';

if($_GET){
	if(isset($_FILES['upload'])){
		if($_FILES["upload"]["error"]) {
			echo "Error: " . $_FILES["upload"]["error"] . "<br>";
		} else {
			if (file_exists($path . $_FILES["upload"]["name"])) {				
				$status = 409;
				$message = 'error file exists';
				$output['details']['content-name'] = $_FILES["upload"]["name"];
				$output['details']['content-url'] = $path;
			} else {
				if(move_uploaded_file($_FILES["upload"]["tmp_name"], $path.$_FILES["upload"]["name"])){
					$status = 200;
					$message = 'upload successful';
					$output['details']['content-name'] = $_FILES["upload"]["name"];
					$output['details']['content-url'] = $path;
				}
			}
		}
	
	}
} 

//echo json_encode(scandir($path));
//echo unlink($path.'ER-bg.jpg');

header("HTTP/1.1".$status.$message);
echo json_encode($output, JSON_UNESCAPED_SLASHES);

?>