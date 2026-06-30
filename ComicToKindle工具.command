#!/bin/bash

# 始终以启动器自身所在目录作为项目目录，复制或同步到其他 Mac 后无需修改路径。
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_DIR="$SCRIPT_DIR"

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  osascript -e "display alert \"找不到 ComicToKindle 项目\" message \"启动器所在目录缺少 package.json：$PROJECT_DIR\" as critical"
  exit 1
fi

choice=$(osascript <<'APPLESCRIPT'
set taskList to {¬
  "启动开发环境（npm run dev）", ¬
  "打包本地 DMG（npm run build:mac）", ¬
  "运行发布前体检（npm run pack:doctor）", ¬
  "下载或修复 Waifu2x 引擎（npm run fetch:upscale）", ¬
  "运行类型检查（npm run typecheck）", ¬
  "运行代码检查（npm run lint）", ¬
  "构建应用代码（npm run build）", ¬
  "提交并推送已暂存代码到 GitHub（git commit + push）", ¬
  "正式发布到 GitHub（npm run release:mac）"}

set picked to choose from list taskList with title "ComicToKindle 工具" with prompt "请选择要执行的任务：" OK button name "运行" cancel button name "取消" without multiple selections allowed
if picked is false then return ""
return item 1 of picked
APPLESCRIPT
)

if [[ -z "$choice" ]]; then
  exit 0
fi

case "$choice" in
  "启动开发环境（npm run dev）")
    command=(npm run dev)
    ;;
  "打包本地 DMG（npm run build:mac）")
    command=(npm run build:mac)
    ;;
  "运行发布前体检（npm run pack:doctor）")
    command=(npm run pack:doctor)
    ;;
  "下载或修复 Waifu2x 引擎（npm run fetch:upscale）")
    command=(npm run fetch:upscale -- --force)
    ;;
  "运行类型检查（npm run typecheck）")
    command=(npm run typecheck)
    ;;
  "运行代码检查（npm run lint）")
    command=(npm run lint)
    ;;
  "构建应用代码（npm run build）")
    command=(npm run build)
    ;;
  "提交并推送已暂存代码到 GitHub（git commit + push）")
    action="git-publish"
    command=()
    ;;
  "正式发布到 GitHub（npm run release:mac）")
    confirmed=$(osascript -e 'display dialog "此操作可能上传构建产物到 GitHub Release。确定继续吗？" with title "确认正式发布" buttons {"取消", "继续发布"} default button "取消" with icon caution' -e 'button returned of result')
    if [[ "$confirmed" != "继续发布" ]]; then
      exit 0
    fi
    command=(npm run release:mac)
    ;;
  *)
    osascript -e 'display alert "无法识别所选任务" as critical'
    exit 1
    ;;
esac

cd "$PROJECT_DIR" || exit 1

printf '\nComicToKindle 工具\n'
printf '项目：%s\n' "$PROJECT_DIR"
printf '任务：%s\n\n' "$choice"

if [[ "$action" == "git-publish" ]]; then
  if git diff --cached --quiet; then
    osascript -e 'display alert "没有已暂存的改动" message "请先使用 git add 暂存要提交的文件，再运行此任务。" as warning'
    status=1
  else
    commit_message=$(osascript <<'APPLESCRIPT'
set dialogResult to display dialog "请输入本次提交说明：" with title "提交到 GitHub" default answer "" buttons {"取消", "提交并推送"} default button "提交并推送" cancel button "取消"
return text returned of dialogResult
APPLESCRIPT
)
    if [[ -z "$commit_message" ]]; then
      printf '已取消：提交说明不能为空。\n'
      status=1
    else
      printf '即将提交的内容：\n'
      git diff --cached --stat
      printf '\n提交说明：%s\n\n' "$commit_message"
      git commit -m "$commit_message"
      status=$?
      if [[ $status -eq 0 ]]; then
        current_branch=$(git branch --show-current)
        git push -u origin "$current_branch"
        status=$?
      fi
    fi
  fi
else
  "${command[@]}"
  status=$?
fi

if [[ $status -eq 0 ]]; then
  osascript -e 'display notification "任务已成功完成" with title "ComicToKindle 工具"'
  printf '\n任务执行成功。\n'
else
  osascript -e "display alert \"任务执行失败\" message \"退出码：$status，请查看 Terminal 中的错误信息。\" as critical"
  printf '\n任务执行失败，退出码：%s\n' "$status"
fi

printf '按回车键关闭窗口…'
read -r
exit "$status"
