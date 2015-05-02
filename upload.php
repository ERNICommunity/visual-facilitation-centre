<?php


if ( !empty( $_FILES ) ) {


$name = $_FILES["file"]["name"];
$ext = end((explode(".", $name))); # extra () to prevent notice




    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $ext = pathinfo($tempPath, PATHINFO_EXTENSION);

    $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];


    $cmd = 'convert ' . $tempPath . '.' . $ext . ' -resize 400 -quality 90 ' . $tempPath. '.' . $ext;


    move_uploaded_file( $tempPath, $uploadPath );




    $output = shell_exec($cmd);

    $answer = array( 'answer' => 'File transfer completed' );
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>