var {{ printf "track_%s" (md5 .Content) | safeJS }} = {{ .Content }};
