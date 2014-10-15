<?php

header("Content-Type:application/json");
$path = 'uploads/'; //set foldername
$output = [];
$status = 404;
$message = 'Not Found';

function resize(input){
	$thumb = new Imagick(input);
	$thumb->resizeImage(400,400,Imagick::FILTER_LANCZOS,1);
	$thumb->writeImage(input);
	$thumb->clear();
	$thumb->destroy(); 
}

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
							resize($path.$_FILES['image']["name"][$i]);
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
			if($_FILES['image']["error"][0] != 0) {
				$status = 409;
				$output = $_FILES['image']["error"][0];
				$message = "Error: " . $_FILES['image']["error"][0];
			} else {
				if (file_exists($path . $_FILES['image']["name"][0])) {				
					$status = 204;
					$message = 'error file exists';
					$output['details']['content-name'] = $_FILES['image']["name"][0];
					$output['details']['content-url'] = $path;
				} else {
					if(move_uploaded_file($_FILES['image']["tmp_name"][0], $path.$_FILES['image']["name"][0])){
						$status = 201;
						$message = 'upload successful';
						$output['details']['content-name'] = $_FILES['image']["name"][0];
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