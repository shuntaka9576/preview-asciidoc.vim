#  preview-asciidoc.vim
*🚧 This plugin is in experimental use. 🚧*

Preview [Asciidoctor](https://asciidoctor.org/docs/user-manual/) in real-time!

![demo](https://res.cloudinary.com/dkerzyk09/image/upload/v1691379574/tools/preview-asciidoc.vim/demo.gif)

## Requirements

* [denops.vim](https://github.com/vim-denops/denops.vim)
* asciidoctor("asciidoctor" command in $PATH)
* asciidoctor-diagram
* PlantUML

## Installtaion

```lua
-- lazy.nvim
{
  "shuntaka9576/preview-asciidoc.vim",
  dependencies = {
    "vim-denops/denops.vim",
  }
}
```

## Features
* [ ] Support Vim

## For Development

```vim:init.vim
set runtimepath+=~/repos/github.com/vim-denops/denops.vim
set runtimepath+=~/repos/github.com/shuntaka9576/preview-asciidoc.vim

if !has('nvim')
  set nocompatible
  source ~/repos/github.com/vim-denops/denops.vim/plugin/denops.vim
  source ~/repos/github.com/shuntaka9576/preview-asciidoc.vim/plugin/pasciidoc.vim
endif
```

```
nvim -u ~/repos/github.com/shuntaka9576/init.vim/init.vim ./testdata/test.adoc
```
