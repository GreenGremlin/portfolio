<?php

    require 'vendor/autoload.php';
    require 'functions.php';

    use Symfony\Component\Yaml\Parser;

    $data_dir = dirname(__FILE__).'/data/';

    $phone_match = '~.*(\d{3})[^\d]{,7}(\d{3})[^\d]{,7}(\d{4}).*~';
    $phone_replace = '($1) $2-$3';

    $template_suffix = $_GET[ 'format' ] && $_GET[ 'format' ] != 'htm' ? '.' . $_GET[ 'format' ] : '';

    $mustache = new Mustache_Engine(array(
        'template_class_prefix' => '__MyTemplates_',
        'cache' => dirname(__FILE__).'/tmp/cache/mustache',
        // 'cache_file_mode' => 0666, // Please, configure your umask instead of doing this :)
        // 'cache_lambda_templates' => true,
        'loader' => new Mustache_Loader_FilesystemLoader(dirname(__FILE__).'/templates'),
        'partials_loader' => new Mustache_Loader_FilesystemLoader(dirname(__FILE__).'/templates'),
        // 'helpers' => array('i18n' => function($text) {
        //     // do something translatey here...
        // }),
        'escape' => function($value) {
            return htmlspecialchars($value, ENT_COMPAT, 'UTF-8');
        },
        'charset' => 'ISO-8859-1',
        'logger' => new Mustache_Logger_StreamLogger('php://stderr'),
        'strict_callables' => true,
        'pragmas' => [Mustache_Engine::PRAGMA_FILTERS],
    ));

    // $file_contents = file_get_contents($data_dir.'jonathan_felchlin.json');
    // $data = json_decode($file_contents, true);

    $file_contents = file_get_contents($data_dir.'jonathan_felchlin.yaml');

    $yaml = new Parser();
    $data = $yaml->parse($file_contents);

    // if ($error = json_last_error_msg()) {
    //     print_r(sprintf("<pre>Encountered the following error: %s\nWhile parsing string:\n'%s'", $error, $file_contents));
    // }

    if ($data["phone"] != NULL && $data["phone_formatted"] == NULL) {
        $data["phone_formatted"] = preg_replace($phone_match, $phone_replace, $data["phone"]). "\n";
    }

    foreach($data["sections"] as &$section) {
        if ($section["type"] == NULL) {
            $section["type"] = "section";
        }

        $partial = $mustache->loadTemplate($section["type"].$template_suffix);
        $section["rendered_content"] = $partial->render($section);
    }

    $tpl = $mustache->loadTemplate('resume'.$template_suffix);
    echo $tpl->render($data);
?>
