<?php

header("Content-Type:application/json");
$path = 'uploads/'; //set foldername
$output = [];
$status = 404;
$message = 'Not Found';

if(isset($_REQUEST)){
	if(isset($_FILES['image'])){

		if(count($_FILES['image']['name'])>1){
			//multiple file upload
			for($i=0; $i<count($_FILES['image']['name']); $i++){
				if($_FILES['image']["error"][$i] != 0) {
					$status = 206;
					$output = $_FILES['image']["error"][$i];
					$message = "Error: " . $_FILES['image']["error"][$i];
				} else {
					if (file_exists($path . $_FILES['image']["name"][$i])) {				
						$status = 204;
						$message = 'error file exists';
						$output['details']['content-name'] = $_FILES['image']["name"][$i];
						$output['details']['content-url'] = $path;
					} else {
						if(move_uploaded_file($_FILES['image']["tmp_name"][$i], $path.$_FILES['image']["name"][$i])){
							$status = 201;
							$message = 'upload successful';
							$output['details']['content-name'] = $_FILES['image']["name"][$i];
							$output['details']['content-url'] = $path;
						}
					}
				}
			}
		} else {
			//single file upload
			if($_FILES['image']["error"] != 0) {
				$status = 409;
				$output = $_FILES['image']["error"];
				$message = "Error: " . $_FILES['image']["error"];
			} else {
				if (file_exists($path . $_FILES['image']["name"])) {				
					$status = 204;
					$message = 'error file exists';
					$output['details']['content-name'] = $_FILES['image']["name"];
					$output['details']['content-url'] = $path;
				} else {
					if(move_uploaded_file($_FILES['image']["tmp_name"], $path.$_FILES['image']["name"])){
						$status = 201;
						$message = 'upload successful';
						$output['details']['content-name'] = $_FILES['image']["name"];
						$output['details']['content-url'] = $path;
					}
				}
			}
		}
	
	} else {
		$status = 409;
		$message = "file upload not found";
	}
} 

//echo json_encode(scandir($path));
//echo unlink($path.'ER-bg.jpg');

header("HTTP/1.1".$status.$message);
http_response_code($status);
echo json_encode($output, JSON_UNESCAPED_SLASHES);

?>