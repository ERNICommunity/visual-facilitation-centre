<?php 

header("Content-Type:application/json");
$path = 'uploads/'; //set foldername
$output = [];
$status = 404;
$message = 'Not Found';

if(isset($_POST)){
	if(isset($_POST['delete']['name'])){
			if(file_exists($path . $_POST['delete']["name"])){
				unlink($path . $_POST['delete']["name"]);
				$status = 201;
				$message = 'deleting file '.$_POST['delete']["name"].' successful';
			} else {
				$status = 204;
				$message = "Error: " . $_POST['delete']["name"] . 'not found';
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