<?php
 class dashboard_lib { public function __construct() { } function fetchjson($file) { goto A5ce749c45b271c48d2a57dff844c1e4; B46ed894bf67d1c49d71fd83c3b25a3f: return $json_data; goto D46693a347bdacb25820459730fe293e; b268686bfc4a4aeec688a2ef28f2d56c: $json_data = json_decode($string, true); goto B46ed894bf67d1c49d71fd83c3b25a3f; A5ce749c45b271c48d2a57dff844c1e4: $string = file_get_contents($file); goto b268686bfc4a4aeec688a2ef28f2d56c; D46693a347bdacb25820459730fe293e: } function adjustColortheme($hex, $steps) { goto D5c50a5ae98f6ba179255d8e23629f98; B962328ed31f1e66124c0b7ebb8b3260: return "\x23" . $return; goto d9130827cf199eff96896d073951c809; df6fa9249f9abe8b75b5e181656efb4f: if (!($b < 0)) { goto cb996aa46678734ef85c7632b210cd1c; } goto Bb48587a808caab47def54d6f6408a0e; a0da9c6e2513db95f526c39e2237969e: Bf0a56878420707c113dcc4d49448a35: goto b0eb3dc99bb1447121d0f87e7ea88f4a; E254e3712558f616d9a9b0397849d620: $g = 0; goto a70d04307b587b53ccfbf427a509a10a; Bc7995e51fb6e52f00ff7f193f1def0e: if (!($r < 0)) { goto D23ea2276017855e3eb89baec2f81b61; } goto fe2377d27f3015eb6141c16a1a782abb; Bb48587a808caab47def54d6f6408a0e: $b = 0; goto A96763c023921c0a4b61e8143c9a21c8; ad0b3a3e853461e8493b42e21c38d765: $b = ($num >> 8 & 0xff) + $steps; goto fae2e50e75c232c6d61ebdaa750cf9fc; f6a05686c125f36bda5fbd4ae9e2abda: e81cd84e9d31a0fa2db3ff03ba39afd8: goto Fa3d0e8754b7b8ecdbd2fddbdb18d6c4; Fa3d0e8754b7b8ecdbd2fddbdb18d6c4: $b = 255; goto D745581cf8c118ed261c8dccde896464; b0eb3dc99bb1447121d0f87e7ea88f4a: $g = 255; goto af6245569f4c3c7d82a627f2cf5c8d49; eb260e95fbb61fea58608bf18acd828a: goto A06c8f6fc557b8d491f6fdaa44d6ab48; goto f6a05686c125f36bda5fbd4ae9e2abda; c8fc6ccc7683902c189d6a0fd32a4b72: $r = ($num >> 16) + $steps; goto Ce6dcd2b2992d06c8b1ae0c86d321c19; B73e0bf3e37ec6f586aa75cd7ab9c889: if (!(strlen($return) < 4)) { goto C942fe20dd5ca76fbbf8914c3058406c; } goto C35e3444269b615c082e417aa37d0d80; A96763c023921c0a4b61e8143c9a21c8: cb996aa46678734ef85c7632b210cd1c: goto eb260e95fbb61fea58608bf18acd828a; Ef4a5b4c5f09ef816339558d78d4b3a0: $return = str_pad(dechex($g | $b << 8 | $r << 16), 2, "\x30", STR_PAD_LEFT); goto B73e0bf3e37ec6f586aa75cd7ab9c889; D5c50a5ae98f6ba179255d8e23629f98: $num = str_replace("\x23", '', $hex); goto d5121ea47deaac98dae0e3b3b877d074; d5121ea47deaac98dae0e3b3b877d074: $num = hexdec($num); goto c8fc6ccc7683902c189d6a0fd32a4b72; Becef13457587a556f9bbc615742f76a: Ad1f29dfc882d3d88fa77a7507d3c7c5: goto Bc7995e51fb6e52f00ff7f193f1def0e; fae2e50e75c232c6d61ebdaa750cf9fc: if ($b > 255) { goto e81cd84e9d31a0fa2db3ff03ba39afd8; } goto df6fa9249f9abe8b75b5e181656efb4f; D745581cf8c118ed261c8dccde896464: A06c8f6fc557b8d491f6fdaa44d6ab48: goto D28da314d0bb48155f0ccb0997f324f4; Dfa6389c1501126f90a1c2c107016787: C942fe20dd5ca76fbbf8914c3058406c: goto B962328ed31f1e66124c0b7ebb8b3260; fe2377d27f3015eb6141c16a1a782abb: $r = 0; goto E03d29338bb2e660bb599e746b106954; Ce6dcd2b2992d06c8b1ae0c86d321c19: if (!($r > 255)) { goto Ad1f29dfc882d3d88fa77a7507d3c7c5; } goto A2745c20292997cd10d7d0ae407ccd64; A2745c20292997cd10d7d0ae407ccd64: $r = 255; goto Becef13457587a556f9bbc615742f76a; D6a2236ac07be62bc91459094cf39893: if (!($g < 0)) { goto cf910fc12073f66dca2b51bd13d206a4; } goto E254e3712558f616d9a9b0397849d620; d596e56f0ed68247f27d99d16ab8e2ff: goto Bdf303a7f3d9363c7611057dbd329b2c; goto a0da9c6e2513db95f526c39e2237969e; Fa0b0bf7cb6bbbf0cbb0953a7584ebd8: if ($g > 255) { goto Bf0a56878420707c113dcc4d49448a35; } goto D6a2236ac07be62bc91459094cf39893; a70d04307b587b53ccfbf427a509a10a: cf910fc12073f66dca2b51bd13d206a4: goto d596e56f0ed68247f27d99d16ab8e2ff; C35e3444269b615c082e417aa37d0d80: $return = $return . $return; goto Dfa6389c1501126f90a1c2c107016787; E03d29338bb2e660bb599e746b106954: D23ea2276017855e3eb89baec2f81b61: goto ad0b3a3e853461e8493b42e21c38d765; af6245569f4c3c7d82a627f2cf5c8d49: Bdf303a7f3d9363c7611057dbd329b2c: goto Ef4a5b4c5f09ef816339558d78d4b3a0; D28da314d0bb48155f0ccb0997f324f4: $g = ($num & 0xff) + $steps; goto Fa0b0bf7cb6bbbf0cbb0953a7584ebd8; d9130827cf199eff96896d073951c809: } function userlist() { goto acbd89fdc206dd20e6b4e8c291f0153d; f733fc6ed98d39e7535a24e19f16ba11: return $userlist; goto Fdacd3d357d53370dc853a197e0ec1dc; d1b654dbcfa6984c2d137b3581c4e8cd: $data = fgetcsv($fp, 100, "\x2c"); goto Fcad963cc480c653db6a40256ebd50fc; a68513ffe5aa101bbf136f247ccef1b8: e89336f6ac24c4b6ec053ddd71ed4c7e: goto ea05bc0cb169e4c7ae70584ae5e831d0; b7efc4558658e9f94da66ef6cf959bb1: goto e89336f6ac24c4b6ec053ddd71ed4c7e; goto f8265aea3f6f8322a071228748831b9b; cc9df32ea1b4959a05a8e077989aa3e5: $fp = fopen($systemdb, "\x72\53"); goto E8a7b1b8d5860426d8ab6e7ae193381e; E8a7b1b8d5860426d8ab6e7ae193381e: $userlist = array(); goto b720d8c3eb9e0d7b064b68b900519757; acbd89fdc206dd20e6b4e8c291f0153d: $systemdb = DATA . "\165\x73\x65\162\163\x2e\144\x62"; goto cc9df32ea1b4959a05a8e077989aa3e5; D66b0ac4f7ff32d75c8ab8207a53e9ef: $i++; goto A599b70a8fb46a66d77ed5ea6b21251b; a26534deb88ec5ee83b7d606f91fa8f3: $userlist[$i]["\165\x73\x65\x72\151\x64"] = $data[0]; goto C8edeb4b08fa260891814aa1db2bf56a; Fcad963cc480c653db6a40256ebd50fc: if (empty($data)) { goto fe5c36094ab459b3279b125ff7ddf963; } goto a26534deb88ec5ee83b7d606f91fa8f3; C8edeb4b08fa260891814aa1db2bf56a: $userlist[$i]["\x75\163\x65\x72\156\x61\x6d\145"] = $data[1]; goto D66b0ac4f7ff32d75c8ab8207a53e9ef; f8265aea3f6f8322a071228748831b9b: A2aed7b594d488f11334776ec9b6f834: goto db04ba6e9d3451f9bd015224c15d4609; db04ba6e9d3451f9bd015224c15d4609: c49c3d79ccf41cd097e0e90c4b937b1f: goto f733fc6ed98d39e7535a24e19f16ba11; ea05bc0cb169e4c7ae70584ae5e831d0: if (feof($fp)) { goto A2aed7b594d488f11334776ec9b6f834; } goto d1b654dbcfa6984c2d137b3581c4e8cd; A599b70a8fb46a66d77ed5ea6b21251b: fe5c36094ab459b3279b125ff7ddf963: goto b7efc4558658e9f94da66ef6cf959bb1; b720d8c3eb9e0d7b064b68b900519757: if (!($fp !== FALSE)) { goto c49c3d79ccf41cd097e0e90c4b937b1f; } goto e829783e06b1cf2777d6390f3d729298; e829783e06b1cf2777d6390f3d729298: $i = 0; goto a68513ffe5aa101bbf136f247ccef1b8; Fdacd3d357d53370dc853a197e0ec1dc: } function savefile($filename) { goto d40657bf0cd3b1746b1de8aadeacbee6; E4f85f866abe7f7c2c9e2ba79704a2dd: if (!($_SESSION["\x75\x73\145\162\x69\144"] != 1)) { goto Cd12faf6995daf6b6f3313129024a577; } goto b8c5ad598d9ebde9dd281f283bf6dad2; a3084cdfa47c6277c4949d271bb8c150: $file2 = DATA . "\x6c\141\171\157\165\164\x2e\170\x6d\154"; goto d3e6ba497bc9d800c0fa28f13085b747; e2830a8b3a4c7c7c94152f7055eacf69: $newfile = STORE . $filename . "\56\144\141\164\141"; goto a3084cdfa47c6277c4949d271bb8c150; b3a436d027f3244d6a5a16008a4414e5: D7f5f73caed070e30143b692bdcee8a9: goto b2231ee5581ab5dc97ee201039c63a94; Ddffc59d5a669c3d1cdaf0bfed21efba: $file = DATA . "\144\141\x74\x61\56\170\x6d\x6c"; goto e2830a8b3a4c7c7c94152f7055eacf69; d3e6ba497bc9d800c0fa28f13085b747: $newfile2 = STORE . $filename . "\x2e\x6c\141\171"; goto d6c12aa531f8ec188b0ff77d7ee22e9f; D722b3dd4cb173d6873ce914f53572a3: Cd12faf6995daf6b6f3313129024a577: goto eda4ec5e94581b9f2c71df4552c1c463; C18df6739483cf636a57c2ba40aba920: $newfile = STORE . $_SESSION["\165\x73\x65\x72\151\x64"] . "\x2f" . $filename . "\x2e\144\141\164\x61"; goto F4d60eb7e6f582da160dee63ac84c2ab; C9fb3773c45fd19330be581f731ab544: echo "\x3c\163\x63\162\x69\x70\164\76\141\154\145\162\x74\x20\50\47\x46\x61\x69\x6c\40\164\157\x20\143\x6f\x70\171\x27\51\x3b\x3c\x2f\x73\x63\x72\x69\x70\x74\76"; goto a25e3a2b475fc1d85b4e5353901a2f77; Aaddb4906d227bc0eaeea96bf9bd6953: $newfile2 = STORE . $_SESSION["\x75\163\145\x72\x69\144"] . "\x2f" . $filename . "\x2e\154\x61\x79"; goto D722b3dd4cb173d6873ce914f53572a3; F4d60eb7e6f582da160dee63ac84c2ab: $file2 = DATA . $_SESSION["\x75\163\x65\162\x69\144"] . "\x2f\x6c\141\x79\x6f\165\x74\56\x78\x6d\x6c"; goto Aaddb4906d227bc0eaeea96bf9bd6953; a55c28043a120b5e39e17f1a3e899df1: echo "\x3c\x73\x63\x72\151\x70\164\76\x61\154\x65\162\164\40\x28\47\x46\x61\151\x6c\40\164\157\x20\143\157\x70\171\x27\51\73\74\x2f\163\143\162\151\160\x74\76"; goto b3a436d027f3244d6a5a16008a4414e5; b8c5ad598d9ebde9dd281f283bf6dad2: $file = DATA . $_SESSION["\x75\163\145\162\151\144"] . "\x2f\144\141\x74\x61\56\x78\155\x6c"; goto C18df6739483cf636a57c2ba40aba920; a25e3a2b475fc1d85b4e5353901a2f77: F635e4daac84250f8e7c1056af3b5971: goto b3716b9912234971c077f43d2a57569d; d40657bf0cd3b1746b1de8aadeacbee6: require_once "\x2e\56\x2f\143\157\x6e\x66\x69\x67\x2e\x70\x68\x70"; goto Ddffc59d5a669c3d1cdaf0bfed21efba; da3fe8d6ff539a27cb85a531069b9ae1: if (copy($file, $newfile)) { goto F635e4daac84250f8e7c1056af3b5971; } goto C9fb3773c45fd19330be581f731ab544; d6c12aa531f8ec188b0ff77d7ee22e9f: if (!isset($_SESSION["\x75\163\145\x72\151\x64"])) { goto fdaf8a8dc1b826bcc91db4e46cabd9d6; } goto E4f85f866abe7f7c2c9e2ba79704a2dd; eda4ec5e94581b9f2c71df4552c1c463: fdaf8a8dc1b826bcc91db4e46cabd9d6: goto da3fe8d6ff539a27cb85a531069b9ae1; b3716b9912234971c077f43d2a57569d: if (copy($file2, $newfile2)) { goto D7f5f73caed070e30143b692bdcee8a9; } goto a55c28043a120b5e39e17f1a3e899df1; b2231ee5581ab5dc97ee201039c63a94: } function linkpara($filename) { goto ba7ac7bd703bc6ed7213c00f1206281e; a93c5e463f674362bcd43c03216a2dc9: $linkpara = "\x3f\x70\x61\162\x61\155\75" . $fileid; goto Cd1669b503c730d3f47127acab9b37bf; a518fb878ff9acb4049e315c738c4ede: $fileid = base64_encode("\x26\146\x69\x6c\145\x3d" . $fileid); goto a93c5e463f674362bcd43c03216a2dc9; ba7ac7bd703bc6ed7213c00f1206281e: $userid = $_SESSION["\165\x73\x65\x72\151\x64"]; goto Ddf2ed815c5b16493940a3c01bbbcdd4; a08ef78e5370f1329da4259938c37304: $fileid = $userid . "\x2f" . $fileid; goto fff1adc1f93f175e4503bc453be359be; Cd1669b503c730d3f47127acab9b37bf: return $linkpara; goto Ee4320261490621a417cbdbcd3a46f32; c81d791dab34e59c652299c0806d23bd: if (!($userid != 1)) { goto C0ce96083ba2766be5e0d2091c5d6cd5; } goto a08ef78e5370f1329da4259938c37304; Ddf2ed815c5b16493940a3c01bbbcdd4: $fileid = $filename; goto c81d791dab34e59c652299c0806d23bd; fff1adc1f93f175e4503bc453be359be: C0ce96083ba2766be5e0d2091c5d6cd5: goto a518fb878ff9acb4049e315c738c4ede; Ee4320261490621a417cbdbcd3a46f32: } }
