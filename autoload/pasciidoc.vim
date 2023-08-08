function! s:error_callback(args) abort
endfunction

function! s:success_callback(args) abort
endfunction

function! pasciidoc#init_preview() abort
  call denops#request_async('pasciidoc',
        \ 'initServer',
        \ [],
        \ { args -> s:success_callback(args) },
        \ { args -> s:error_callback(args) },
        \ )
endfunction

function! pasciidoc#refresh_content() abort
  if denops#plugin#wait('pasciidoc') != 0
    return ''
  endif
  call denops#request_async('pasciidoc',
        \ 'refreshContent',
        \ [],
        \ { args -> s:success_callback(args) },
        \ { args -> s:error_callback(args) },
        \ )
endfunction
