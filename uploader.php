<?php

$path = 'uploads/'; //set foldername
$output = [];

if(isset($_FILES['upload'])){
	if($_FILES["upload"]["error"]) {
		echo "Error: " . $_FILES["upload"]["error"] . "<br>";
	} else {
		if (file_exists($path . $_FILES["upload"]["name"])) {
			$output["success"] = 0;
			$output['message'] = 'error file exists';
		} else {
			if(move_uploaded_file($_FILES["upload"]["tmp_name"], $path.$_FILES["upload"]["name"])){
				$output["success"] = 1;
				$output['message'] = 'upload successful';
				$output['details']['content-name'] = $_FILES["upload"]["name"];
				$output['details']['content-url'] = $path;
			}
		}
	}

}

echo json_encode($output, JSON_PRETTY_PRINT);

?>