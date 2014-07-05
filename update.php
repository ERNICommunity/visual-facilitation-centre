<?php 
$headers = http_get_request_headers();

if($headers['X-Hub-Signature'] == '1B788A18E'){
	
	
	if($_POST[]){ 
		echo json_encode($_POST[], JSON_UNESCAPED_SLASHES);
		if(`git pull origin master`){
			http_response_code('200');
		}
	};
}

?>