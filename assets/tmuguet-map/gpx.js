var {{ printf "track_%s" (md5 .Content) | safeJS }} = toGeoJSON.gpx(new DOMParser().parseFromString(`{{ .Content }}`, "text/xml"));
