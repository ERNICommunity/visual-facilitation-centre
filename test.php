<?php

      echo '<p>Hello World</p>';
$output = shell_exec("convert '/srv/www/github.visualfacilitation/uploads/8trepj6f9_2012-04-23 12.27.03.jpg' -resize 400 -quality 90 '/srv/www/github.visualfacilitation/uploads/8trepj6f9_2012-04-23 12.27.03.jpg'");


          echo $output;
?>