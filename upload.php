<?php


if ( !empty( $_FILES ) ) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];




    move_uploaded_file( $tempPath, $uploadPath );


    $cmd = 'convert ' . $uploadPath . ' -resize 400 -quality 90 ' . $uploadPath;


    $output = shell_exec($cmd);

    $answer = array( 'answer' => 'File transfer completed' );
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>