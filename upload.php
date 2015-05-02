<?php


if ( !empty( $_FILES ) ) {


error_log("your message");


$name = $_FILES["file"]["name"];

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];


    error_log($tempPath);

    $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];



    error_log('uploads : ' . $uploadPath);


    move_uploaded_file( $tempPath, $uploadPath );


    $answer = array( 'answer' => 'File transfer completed' );
    $json = json_encode( $answer );

    echo $json;

    error_log("END");

} else {

    echo 'No files';

}

?>