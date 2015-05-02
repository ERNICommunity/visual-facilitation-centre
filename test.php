<?php

      echo '<p>Hello World</p>';
$output = shell_exec('convert uploads/testcase.png -resize 400 -quality 90 uploads/testcase6.png');


          echo $output;
?>