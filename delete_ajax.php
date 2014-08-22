<?php 

header("Content-Type:application/json");
$path = 'uploads/'; //set foldername
$output = [];
$status = 404;
$message = 'Not Found';

if(isset($_REQUEST)){
	if(isset($_REQUEST['delete']['name'])){
			if(file_exists($path . $_FILES['delete']["name"])){
				unlink($path . $_FILES['delete']["name"]);
				$status = 201;
				$message = 'deleting file '.$_FILES['delete']["name"].' successful';
			} else {
				$status = 204;
				$message = "Error: " . $_FILES['delete']["name"] . 'not found';
			}
		}
	}  else {
		$status = 209;
		$message = "specified file for deletion not found";
	}
}


header("HTTP/1.1".$status.$message);
http_response_code($status);
echo json_encode($output, JSON_UNESCAPED_SLASHES);

?>