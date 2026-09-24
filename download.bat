@echo off
echo Downloading document 21362 from SIGRID...
curl -L -k -H "User-Agent: Mozilla/5.0" -o "data\SIGRID~1\21362_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-ante-inundaciones-fluviales-ocasionadas-por-lluvias-intensas-distrito-de-eduardo villanueva san marcos cajamarca.pdf" "https://sigrid.cenepred.gob.pe/sigridv3/documento/21362/descargar"
echo Check download:
dir "data\SIGRID~1\*21362*"
