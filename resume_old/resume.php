<?php

    require 'vendor/autoload.php';
    require 'functions.php';

    use Symfony\Component\Yaml\Parser;

    function renderResume ( $data, $format ) {

        $data_dir = dirname(__FILE__) . '/data/';
        $template_dir = dirname(__FILE__) . '/templates';

        $phone_match = '~.*(\d{3})[^\d]{,7}(\d{3})[^\d]{,7}(\d{4}).*~';
        $phone_replace = '($1) $2-$3';

        $template_loader_options = $options =  array(
            'extension' => '.mustache'
        );

        $mustache = new Mustache_Engine( array(
            'template_class_prefix' => '__MyTemplates_',
            'cache' => dirname( __FILE__ ) . '/tmp/cache/mustache',
            // 'cache_file_mode' => 0666, // Please, configure your umask instead of doing this :)
            // 'cache_lambda_templates' => true,
            'loader' => new Mustache_Loader_FilesystemLoader( $template_dir, $template_loader_options ),
            'partials_loader' => new Mustache_Loader_FilesystemLoader( $template_dir, $template_loader_options ),
            // 'helpers' => array('i18n' => function($text) {
            //     // do something translatey here...
            // }),
            'escape' => function( $value ) {
                return htmlspecialchars( $value, ENT_COMPAT, 'UTF-8' );
            },
            'charset' => 'ISO-8859-1',
            'logger' => new Mustache_Logger_StreamLogger( 'php://stderr' ),
            'strict_callables' => true,
            'pragmas' => [ Mustache_Engine::PRAGMA_FILTERS ],
        ) );

        if ( $data[ "phone" ] != NULL && $data[ "phone_formatted" ] == NULL) {
            $data[ "phone_formatted" ] = preg_replace( $phone_match, $phone_replace, $data["phone"] ). "\n";
        }

        $template_suffix = $format != null ? '.' . $format : 'html';

        // handle unsupported formats
        if ( !file_exists( $template_dir . '/resume' . $template_suffix . $template_loader_options[ 'extension' ] ) ) {
            $template_suffix = '';
        }

        foreach ( $data[ 'sections' ] as &$section ) {
            if ( $section[ 'type' ] == NULL ) {
                $section[ 'type' ] = 'section';
            }
            if ( $section[ 'type' ] == 'chronological_list' && ( $format == 'html' || $format == 'htm' ) ) {

                foreach ( $section[ 'content' ] as &$item ) {
                    if ( $item[ 'date' ] ) {
                        $item[ 'date' ] = str_replace( ' - ', ' -&nbsp;', $item[ 'date' ] );
                    }
                }
            }

            $partial = $mustache->loadTemplate( $section["type"] . $template_suffix );
            $section[ "rendered_content" ] = $partial->render( $section );
        }

        $tpl = $mustache->loadTemplate( 'resume'.$template_suffix );
        return $tpl->render( $data );
    }

?>
