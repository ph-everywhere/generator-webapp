#!/usr/bin/ruby
require 'fileutils'

cordova_path = ARGV[0]

root_path = cordova_path.gsub 'cordova', ''

cordova_www_path = cordova_path+'/www'
src_path = root_path+'app'
dist_path = root_path+'dist'

cordova_path = ARGV[0]

puts "[WEBAPP] #{cordova_path} #{root_path} #{src_path} #{dist_path}"

FileUtils.rm_rf"#{cordova_www_path}", secure: true

if ENV['CORDOVA_BUILD'] and ENV['CORDOVA_BUILD'] == 'prod'
  puts '[WEBAPP] Building for Production. Erase env.CORDOVA_BUILD to build for development'
  FileUtils.cp_r dist_path, cordova_www_path
else
  puts '[WEBAPP] Building for Development. export CORDOVA_BUILD=prod for deployment'
  FileUtils.cp_r src_path, cordova_www_path
end
