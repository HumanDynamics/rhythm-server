# ~/.bashrc: executed by bash(1) for non-login shells.

# Note: PS1 and umask are already set in /etc/profile. You should not
# need this unless you want different defaults for root.
# PS1='${debian_chroot:+($debian_chroot)}\h:\w\$ '
# umask 022

# If not running interactively, don't do anything
[ -z "$PS1" ] && return

servicename=rhythm-svr
PS1='\[\033[00;33m\]('${servicename}') \[\033[01;33m\]\u\[\033[00;37m\] \w \[\033[01;36m\]\$\[\033[00m\] '
unset servicename

# colorize `ls'
export LS_OPTIONS='--color=auto'
eval "`dircolors --sh`"

# common ls aliases
alias ls='ls $LS_OPTIONS'
alias ll='ls $LS_OPTIONS -l'
alias lla='ls $LS_OPTIONS -lA'
alias l='ls $LS_OPTIONS -CF'
