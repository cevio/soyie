Name
====

JSON2 - json2 / native JSON normalizer for Joose


SYNOPSIS
========

        // bunlde will include the json2.js lib
        <script src = "/jsan/lib/Task/JSON2/Bundle.js"></script>

        
        // `use` will load it on-demand (requires JooseX.Namespace.Depended)
        use('JSON2', function () {
        
            var str = JSON2.stringify([])
            
            var arr = JSON2.parse('[]')
        })

        


DESCRIPTION
===========

`JSON2` is a normalizing wrapper around the json2 library and native JSON implementation in supporting browsers.


USAGE
=====

Since its only a thin wrapper you should only use the features intersection between json2 & native JSON. For example,
seems the native implementation of `JSON.parse` in FF do not accept 2nd argument. 


GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/JSON2/issues>

For general Joose questions you can also visit [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1) 
on irc.freenode.org or the mailing list at: <http://groups.google.com/group/joose-js>
 


SEE ALSO
========

[Using JSON in Firefox](https://developer.mozilla.org/en/Using_JSON_in_Firefox)

BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/JSON2/issues>



AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>





COPYRIGHT AND LICENSE
=====================

This software is Copyright (c) 2010 by Nickolay Platonov.

This is free software, licensed under:

  The GNU Lesser General Public License, Version 3, June 2007
