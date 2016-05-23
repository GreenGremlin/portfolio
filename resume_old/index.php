<?php
    require 'resume.php';

    use Symfony\Component\Yaml\Parser;

    $data_dir = dirname(__FILE__) . '/data/';

    $file_contents = file_get_contents( $data_dir.'jonathan_felchlin.yaml' );

    $yaml = new Parser();
    $data = $yaml->parse( $file_contents );

    if ( $_GET[ 'format' ] == 'md' || $_GET[ 'format' ] == 'txt' ) {
        echo '<pre>';
    }
    echo renderResume( $data, $_GET[ 'format' ] );

    if ( $_GET[ 'format' ] == 'md' || $_GET[ 'format' ] == 'txt' ) {
        echo '</pre>';
    }
?>
