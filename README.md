# preview-asciidoc.vim

Preview [Asciidoctor](https://asciidoctor.org/docs/user-manual/) in real-time with neovim/Vim.

![demo](https://res.cloudinary.com/dkerzyk09/image/upload/v1691379574/tools/preview-asciidoc.vim/demo.gif)

## Requirements

Install Deno.

[denops.vim](https://github.com/vim-denops/denops.vim) requires the latest version of Deno. See [Deno's official manual](https://deno.land/manual/getting_started/installation) for details.

Install asciidoctor tools.

```bash
# "asciidoctor" command in $PATH
brew install asciidoctor
gem install asciidoctor-diagram
```

Install graphviz.

```bash
brew install cask
brew install oracle-jdk --cask
brew install graphviz
```

## Installation

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
