#!/bin/bash

cd target
# 获取当前目录中的所有文件列表
file_list=$(ls)

# 遍历文件列表
for file in $file_list
do
  cd $file
  echo $(pwd)
  tgz
  cd ..
done