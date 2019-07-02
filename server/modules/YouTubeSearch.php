<?php
class YouTubeSearch
{
    function getContent($value)
    {
        //Strip whitespace (or other characters) from the beginning and end of a string
        $value=trim($value);
        //Perform a regular expression search and replace
        $value = preg_replace('/\s+/', ' ',$value);
        //Replace all occurrences of the search string with the replacement string
        $value = str_replace(' ', '+', $value);


        $homepage = file_get_contents('https://www.youtube.com/results?search_query=' . $value);
		$homepage = mb_convert_encoding($homepage, 'HTML-ENTITIES', "UTF-8");
        $doc = new DOMDocument("1.0", "utf-8");
        libxml_use_internal_errors(TRUE); //disable libxml errors
        //check if any html is actually returned
        if (!empty($homepage)) {
            $doc->loadHTML($homepage);
            //remove errors for yucky HTML
            libxml_clear_errors();
            $scriptXpath = new DOMXPath($doc);
            //get all this elements
            $titles = $scriptXpath->query('//*[@class="item-section"]/li[position()>0]/div/div/div/h3/a');
            $videos = array();
            foreach ($titles as $index=>$vid) {
                $videoTitle = $vid->getAttribute("title");
                $videoUrl = 'https://youtube.com' .$vid->getAttribute("href");
				$videoImg =  'https://img.youtube.com/vi/'.substr($videoUrl, strpos($videoUrl, "v=")+2, 11).'/0.jpg';
                $videos[] = [
                    'title' => $videoTitle,
                    'url' => $videoUrl,
					'image' => $videoImg,
                ];
            }
        }
        return $videos;
    }
}