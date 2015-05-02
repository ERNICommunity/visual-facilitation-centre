<?php

         function resize(input){
         	$thumb = new Imagick(input);
         	$thumb->resizeImage(400,400,Imagick::FILTER_LANCZOS,1);
         	$thumb->writeImage(input);
         	$thumb->clear();
         	$thumb->destroy();
         }



if ( !empty( $_FILES ) ) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];




    move_uploaded_file( $tempPath, $uploadPath );


    $output = shell_exec('convert uploads/' . $_FILES[ 'file' ][ 'name' ] . '-resize 400 -quality 90 uploads/' . $_FILES[ 'file' ][ 'name' ]);

    $answer = array( 'answer' => 'File transfer completed' );
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>