
WITH c (company_id) as (
SELECT loopshare.insert_company('balablabla'::TEXT) as company_id
)
SELECT company_id,companyname,email,phonenumber
FROM c JOIN loopshare.companies ON (c.company_id = companies.id)


WITH c (company_id) as (
SELECT loopshare.insert_company('balablabla'::TEXT) as company_id
)
SELECT company_id,companyname,email,phonenumber
FROM c JOIN loopshare.companies ON (c.company_id = companies.id)
