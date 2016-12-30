const styles = [
    {css: 'audios', match: 'audios'},
    {css: 'friends', match: 'friends'}
];

var lang, emoji;

var options = {optionCover: false};

chrome.storage.local.get(function (items) {
    Object.assign(options, items)
});

window.addEventListener('message', function (event) {
    if (event.source == window) {
        switch (event.data.type) {
            case 'VK_INFO':
                lang = event.data.text.lang;
                document.documentElement.setAttribute('lang', langMap[lang]);
                LocalizedContent.init();
                break;
            case 'VK_EMOJI':
                emoji = event.data.text;
                break
        }
    }
});

var injectStart = document.createElement('script');
injectStart.type = 'text/javascript';
injectStart.src = chrome.extension.getURL('content/injectStart.js');

document.arrive('head', {onceOnly: true, existing: true}, function () {
    chrome.storage.local.get('enabled', function (item) {
        if (item.enabled) {
            document.querySelector("link[rel*='icon']").href = "https://vk.com/images/favicon.ico";
            document.head.appendChild(injectStart);
            checkCSS(styles);
            insertCSS('local');
            insertCSS('main');
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (request.action == 'updating') {
                    updateCSS(request.css);
                    updating(request.path)
                }
            });
            initArrives();
        }
    });
});

window.addEventListener('beforeunload', function () {
    Arrive.unbindAllArrive();
});

function insertCSS(style) {
    var css = chrome.extension.getURL('content/' + style + '.css');
    if (!document.getElementById('oldvk-style-' + style)) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = css;
        link.id = 'oldvk-style-' + style;
        insertAfter(document.head, link);
    }
}

function updateCSS(styles) {
    styles.forEach(function (style) {
        if (style.apply) document.head.classList.add('oldvk-' + style.css);
        else document.head.classList.remove('oldvk-' + style.css);
    })
}

function checkCSS(styles) {
    var Styles = [];
    var url = document.createElement('a');
    url.href = window.location.href;
    var path = url.pathname.slice(1);
    styles.forEach(function (style) {
        var apply = !!path.startsWith(style.match);
        Styles.push({css: style.css, apply: apply})
    });
    updateCSS(Styles)
}

var LocalizedContent = {
    l_ntf: document.createElement('li'),
    l_edit: document.createElement('a'),
    l_set: document.createElement('li'),

    init: function () {
        this.l_ntf.id = 'l_ntf';
        this.l_ntf.innerHTML = '<a href="/feed?section=notifications" class="left_row" onclick="return nav.go(this, event, {noback: true, params: {_ref: \'left_nav\'}});" onmouseover="TopNotifier.preload(); if (!TopNotifier.shown()) {ntf = setTimeout(function(){TopNotifier.show(event)},2000)}" onmouseout="clearTimeout(ntf);"><span class="left_fixer"><span class="left_count_wrap fl_r" id="oldvk-notify-wrap" onmouseover="TopNotifier.preload()" onclick="TopNotifier.show(event);"><span class="inl_bl left_count" id="oldvk-notify"></span></span><span class="left_label inl_bl">' + i18n.answers[lang] + '</span></span></a>';

        this.l_edit.id = 'l_edit';
        this.l_edit.classList.add('fl_r');
        this.l_edit.href = '/edit';
        this.l_edit.textContent = i18n.edit[lang];

        this.l_set.id = 'l_sett';
        this.l_set.innerHTML = '<a href="/settings" class="left_row"><span class="left_fixer"><span class="left_label inl_bl" id="oldvk-settings">' + i18n.settings[lang] + '</span></span></a>';
        document.arrive('#side_bar_inner', {onceOnly: true, existing: true}, function () {
            LocalizedContent.updateMenu();
        });

        var top_menu = '<div class="head_nav_item fl_r"><a id="oldvk_top_exit" class="top_nav_link" href="" onclick="if (checkEvent(event) === false) { window.Notifier && Notifier.lcSend(\'logged_off\'); location.href = this.href; return cancelEvent(event); }" onmousedown="tnActive(this)"><div class="top_profile_name"></div></a></div><div class="head_nav_item fl_r"><a id="oldvk_top_help" class="top_nav_link" href="/support?act=home" onclick="return TopMenu.select(this, event);"><div class="top_profile_name"></div></a></div><div class="head_nav_item fl_r"><a id="oldvk_top_music" class="top_nav_link" href="" onclick="return (checkKeyboardEvent(event) ? showAudioLayer(event, this) : false);" onmouseover="prepareAudioLayer()" onmousedown="return (checkKeyboardEvent(event) ? false : showAudioLayer(event, this))"><div class="top_profile_name">' + i18n.music[lang] + '</div><div id="oldvk_top_play" class="oldvk-hide" onclick="cancelEvent(event); if (getAudioPlayer().isPlaying()) {getAudioPlayer().pause(); removeClass(this,\'active\')} else {getAudioPlayer().play(); addClass(this,\'active\')}" onmousedown="cancelEvent(event);"></div></a><span id="oldvk_talp"></span></div><div class="head_nav_item fl_r"><a id="oldvk_top_apps" class="top_nav_link" href="/apps" onclick="return TopMenu.select(this, event);"><div class="top_profile_name">' + i18n.games[lang] + '</div></a></div><div class="head_nav_item fl_r"><a id="oldvk_top_communities" class="top_nav_link" href="/search?c[section]=communities" onclick="return TopMenu.select(this, event);"><div class="top_profile_name">' + i18n.communities[lang] + '</div></a></div><div class="head_nav_item fl_r"><a id="oldvk_top_peoples" class="top_nav_link" href="/search?c[section]=people" onclick="return TopMenu.select(this, event);"><div class="top_profile_name">' + i18n.people[lang] + '</div></a></div>';
        var tmw = document.createElement('div');
        tmw.innerHTML = top_menu;
        document.arrive('#top_nav', {onceOnly: true, existing: true}, function () {
            this.appendChild(tmw);
            var ote = document.getElementById('oldvk_top_exit');
            var tll = document.getElementById('top_logout_link');
            var oth = document.getElementById('oldvk_top_help');
            var tsl = document.getElementById('top_support_link');
            if (ote && tll) {
                ote.firstElementChild.textContent = tll.textContent.toLowerCase();
                ote.href = tll.href;
            }
            if (oth && tsl) oth.firstElementChild.textContent = tsl.textContent.toLowerCase();
            if (document.getElementById('oldvk_talp')) {
                document.getElementById('top_audio_layer_place').remove();

                document.getElementById('oldvk_talp').id = 'top_audio_layer_place';
            }
        })
    },
    updateMenu: function () {
        if (!document.getElementById('l_ntf'))
            insertAfter(document.getElementById('l_nwsf'), this.l_ntf);
        if (!document.getElementById('l_edit')) {
            var l_edit_b = document.getElementById('l_pr').getElementsByClassName('left_fixer')[0];
            l_edit_b.insertBefore(this.l_edit, l_edit_b.firstChild);
        }
        if (!document.getElementById('l_sett')) {
            if (document.getElementById('l_fav'))
                insertAfter(document.getElementById('l_fav'), this.l_set);
            else
                insertAfter(document.getElementById('l_ntf'), this.l_set);
        }
        LocalizedContent.updateNotify()
    },
    updateNotify: function () {
        var notifyCount = parseInt(document.getElementById('top_notify_count').textContent, 10);
        if (notifyCount > 0) document.getElementById('oldvk-notify-wrap').classList.add('has_notify');
        document.getElementById('oldvk-notify').textContent = notifyCount.toString();
    },
    l10n: function (key, callback) {
        if (typeof lang != 'undefined') {
            callback(i18n[key][lang])
        } else {
            setTimeout(function () {
                LocalizedContent.l10n(key, callback)
            }, 0);
        }
    }
};

function initArrives() {

    document.arrive('.page_cover', {existing: true}, function () {
        if (!options.enabled) return;
        if (options.optionCover) {
            this.classList.add('adapted')
        } else {
            var page_actions = document.getElementsByClassName('group_actions_wrap')[0];
            var nc = document.getElementById('narrow_column');
            var page_block = document.createElement('div');
            page_block.className = 'page_block page_photo';
            page_block.innerHTML = '<div class="page_avatar_wrap"><div class="page_avatar" id="page_avatar"></div></div>';
            page_block.appendChild(page_actions);
            var page_avatar_a = document.getElementsByClassName('page_cover_image')[0];
            page_avatar_a.className = '';
            page_avatar_a.firstElementChild.className = 'page_avatar_img';
            var temp = eval('(' + page_avatar_a.getAttribute('onclick').match(/{.*}/)[0] + ')').temp;
            page_avatar_a.firstElementChild.setAttribute('src', temp.base + temp.x_[0] + '.jpg');
            nc.insertBefore(page_block, nc.firstChild);
            document.getElementById('page_avatar').appendChild(page_avatar_a)
        }
    });

    document.arrive('#friends', {existing: true}, function () {
        if (!options.enabled) return;
        var urr = document.getElementById('ui_rmenu_requests');
        if (urr) {
            urr.className = 'ui_tab';
            var ftr = document.createElement('li');
            ftr.id = 'friends_tab_requests';
            urr.setAttribute('onclick', urr.getAttribute('onclick').replace('Menu', 'Tab'));
            ftr.appendChild(urr);
            if (document.getElementById('friends_tab_online')) insertAfter(document.getElementById('friends_tab_online'), ftr);
            if (this.classList.contains('friends_requests')) {
                urr.classList.add('ui_tab_sel');
                document.getElementById('friends_tab_all').firstElementChild.classList.remove('ui_tab_sel')
            }
        }
        if (document.getElementsByClassName('ui_search_fltr')[0]) document.getElementsByClassName('ui_search_fltr')[0].appendChild(document.getElementsByClassName('ui_rmenu')[0]);
        else document.getElementsByClassName('ui_rmenu')[0].parentNode.removeChild(document.getElementsByClassName('ui_rmenu')[0]);
        if (document.getElementById('friends_tabs_wrap')) {
            document.getElementById('friends_tabs_wrap').appendChild(document.getElementById('friends_list_edit_btn'));
            document.getElementById('friends_tabs_wrap').appendChild(document.getElementById('friends_list_delete_btn'));
            var urs = document.createElement('div');
            urs.className = 'ui_rmenu_sep';
            if (document.getElementById('ui_rmenu_lists_list')) document.getElementById('ui_rmenu_lists_list').insertBefore(urs, document.getElementsByClassName('friends_create_list')[0])
        } else {
            insertAfter(this.firstElementChild, document.getElementById('friends_import_block'));
            var uhes = document.getElementsByClassName('ui_header_ext_search')[0];
            document.getElementById('friends_import_block').appendChild(uhes);
            uhes.className = 'friends_import_row clear_fix';
            var fie = document.createElement('div');
            fie.className = 'friends_import_icon friends_import_extended';
            var fic = document.createElement('div');
            fic.className = 'friends_import_cont';
            var fih = document.createElement('div');
            fih.className = 'friends_import_header';
            fih.textContent = uhes.textContent;
            fic.appendChild(fih);
            uhes.appendChild(fie);
            uhes.appendChild(fic);
            uhes.firstChild.textContent = '';
            var fta = document.createElement('div');
            fta.id = 'friends_tab_all';
            var fta_a = document.createElement('a');
            fta_a.className = 'ui_tab';
            fta_a.href = '/friends?section=all';
            LocalizedContent.l10n('all_friends', function (a) {
                fta_a.textContent = a
            });
            fta.appendChild(fta_a);
            var ft_w = document.createElement('div');
            ft_w.className = 'friends_tabs_wrap ui_tabs_header ui_tabs';
            this.insertBefore(ft_w, document.getElementById('friends_import_header'));
            ft_w.appendChild(fta);
            ft_w.appendChild(document.getElementById('friends_import_header'));
            this.insertBefore(document.getElementById('friends_filters_header'), document.getElementById('results'));
            var sqw = document.getElementById('search_query_wrap');
            if (sqw) var ffb_top = sqw.clientHeight + sqw.offsetTop;
            var ffb = document.getElementById('friends_filters_block');
            if (ffb && ffb_top) ffb.style.top = ffb_top + 'px';
        }
    });

    document.arrive('.im-chat-input--textarea', {existing: true}, function () {
        var emoji_div = document.createElement('div');
        emoji_div.id = 'oldvk-emoji';
        var chat = this;
        chat.appendChild(document.getElementsByClassName('im-chat-input--send')[0]);
        chat.appendChild(document.getElementsByClassName('im-chat-input--selector')[0]);
        wait(function () {
            return emoji
        }, function () {
            emoji_div.innerHTML = emoji.html.map(function (e, i) {
                return '<a class="emoji_smile_cont" onmousedown="Emoji.addEmoji(Emoji.last - 1,\'' + emoji.emoji[i] + '\', this); return cancelEvent(event);" onclick="return cancelEvent(event);" onmouseover="return Emoji.emojiOver(Emoji.last - 1, this, true);">' + e + '</a>'
            }).join('');
            chat.insertBefore(emoji_div, document.getElementsByClassName('im-chat-input--selector')[0]);
        });
        var avatar1 = document.createElement('img');
        avatar1.src = document.getElementsByClassName('top_profile_img')[0].src;
        avatar1.className = 'oldvk-chat-avatar';
        this.parentNode.insertBefore(avatar1, this);
        console.log('arrive register');
        document.arrive('.im-page--nav-photo .nim-peer--photo', {existing: true}, function () {
            var avatars = this.getElementsByTagName('img');
            console.log('avatars', avatars);
            var i;

            var tmp = chat.parentNode.getElementsByClassName('oldvk-chat-avatar-wrap');
            for (i = tmp.length; i--;) {
                tmp[i].remove();
            }
            tmp = chat.parentNode.getElementsByClassName('oldvk-chat-avatar-2');
            for (i = tmp.length; i--;) {
                tmp[i].remove();
            }

            if (avatars.length < 3) {
                for (i = avatars.length; i--;) {
                    avatars[i].className = 'oldvk-chat-avatar oldvk-chat-avatar-2';
                    insertAfter(chat, avatars[i].cloneNode(false))
                }
            } else {
                var wrap = document.createElement('div');
                wrap.className = 'oldvk-chat-avatar-wrap';
                for (i = avatars.length; i--;) {
                    avatars[i].className = 'oldvk-chat-avatar-small oldvk-chat-avatar-2';
                    wrap.appendChild(avatars[i].cloneNode(false))
                }
                insertAfter(chat, wrap)
            }
        });

    });

    document.arrive('#ui_rmenu_news_list', {existing: true}, function () {
        var ont = document.createElement('ul');
        ont.id = 'oldvk-news-tabs';
        ont.className = 'ui_tabs ui_tabs_header clear_fix';
        var urn = document.getElementById('ui_rmenu_news');
        var uru = document.getElementById('ui_rmenu_updates');
        var urc = document.getElementById('ui_rmenu_comments');
        var urs = document.getElementById('ui_rmenu_search');
        urn.classList.add('ui_tab');
        uru.classList.add('ui_tab');
        urc.classList.add('ui_tab');
        urs.classList.add('ui_tab');
        var tmp = this.parentNode.getElementsByClassName('ui_rmenu_item');
        for (var i = tmp.length; i--;) tmp[i].setAttribute('onclick', 'newsMenuTabs(this);' + tmp[i].getAttribute('onclick'));
        tmp = this.parentNode.getElementsByClassName('ui_rmenu_subitem');
        for (i = tmp.length; i--;) tmp[i].setAttribute('onclick', 'newsMenuTabs(this);' + tmp[i].getAttribute('onclick'));
        ont.appendChild(urn);
        ont.appendChild(uru);
        ont.appendChild(urc);
        ont.appendChild(urs);
        this.parentNode.parentNode.insertBefore(ont, this.parentNode);
        var urnl = document.getElementById('ui_rmenu_news_list');
        urnl.appendChild(document.getElementById('ui_rmenu_recommended'));
        urnl.appendChild(document.getElementById('ui_rmenu_articles'));
        if (!(urn.classList.contains('ui_rmenu_item_sel') || document.querySelector('#ui_rmenu_news_list .ui_rmenu_item_sel'))) this.parentNode.classList.add('unshown');
        var fali = document.getElementById('feed_add_list_icon');
        fali.classList.add('ui_rmenu_subitem');
        urnl.insertBefore(fali, urnl.firstChild);
        var spb = document.getElementById('submit_post_box');
        if (spb) document.getElementById('feed_filters').parentNode.insertBefore(spb, document.getElementById('feed_filters'));
    });

    document.arrive('#ui_rmenu_communities_list', {existing: true}, function () {
        this.parentNode.appendChild(this);
        document.getElementById('ui_rmenu_communities').addEventListener('click', function () {
            setTimeout(function () {
                document.getElementById('ui_rmenu_communities_list').style.display = 'block'
            }, 200)
        })
    })
}

function updating(path) {
    switch (path) {
        case 'friends':
            window.postMessage({type: "UPD", text: path}, '*');
            break;
    }
}