if exists('g:loaded_pasciidoc')
  finish
endif

let g:loaded_pasciidoc = 1
let g:padoc_root_dir = expand('<sfile>:h:h')

function! s:start_plugin() abort
  command! -buffer AsciidocPreview call pasciidoc#init_preview()
  execute 'augroup PASCIIDOC_INIT' . bufnr('%')
    autocmd!
    autocmd BufWritePost <buffer> :call pasciidoc#refresh_content()
    autocmd CursorHold,CursorHoldI,CursorMoved,CursorMovedI <buffer> :call pasciidoc#refresh_content()
  augroup END
endfunction

function! s:init() abort
  autocmd BufEnter *.{adoc} :call s:start_plugin()
endfunction

call s:init()
