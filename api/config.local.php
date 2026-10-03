<?php
declare(strict_types=1);
return array (
  'app_env' => 'production',
  'app_url' => 'https://yarafraz.ir/gadget-land',
  'db' => 
  array (
    'host' => 'localhost',
    'port' => 3306,
    'name' => 'yarafraz_sh',
    'user' => 'yarafraz_sh',
    'pass' => 'mahglm3352.M',
  ),
  'session' => 
  array (
    'name' => 'gadgetland_session',
    'secure' => true,
  ),
  'payment' => 
  array (
    'driver' => 'disabled',
    'api_key' => '',
    'fee_mode' => 'merchant',
  ),
);
