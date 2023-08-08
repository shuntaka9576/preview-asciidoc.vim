# preview-asciidoc.vim

Preview [Asciidoctor](https://asciidoctor.org/docs/user-manual/) in real-time with neovim/Vim.

![demo](https://res.cloudinary.com/dkerzyk09/image/upload/v1691379574/tools/preview-asciidoc.vim/demo.gif)

## Requirements

denops.vim requires the latest version of Deno. See [Deno's official manual](https://deno.land/manual/getting_started/installation) for details.

- [denops.vim](https://github.com/vim-denops/denops.vim)

Install asciidoctor tools.

- asciidoctor("asciidoctor" command in $PATH)
- asciidoctor-diagram

```bash
brew install asciidoctor
gem install asciidoctor-diagram
```

Install graphviz.

```bash
brew install cask
brew install oracle-jdk --cask
brew install graphviz
```

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

```vim
:AsciidocPreview
```

## For Development

```vim:init.vim
" init.vim
set runtimepath+=~/repos/github.com/vim-denops/denops.vim
set runtimepath+=~/repos/github.com/shuntaka9576/preview-asciidoc.vim

if !has('nvim')
  set nocompatible
  source ~/repos/github.com/vim-denops/denops.vim/plugin/denops.vim
  source ~/repos/github.com/shuntaka9576/preview-asciidoc.vim/plugin/pasciidoc.vim
endif
```

```
nvim -u ./init.vim ./testdata/test.adoc
```
