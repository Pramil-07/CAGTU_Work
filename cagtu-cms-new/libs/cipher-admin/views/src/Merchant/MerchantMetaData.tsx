import { useQuery} from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { urls, CipherAPI } from '@cagtu-cms/data-access';
import {  Group, Select } from '@mantine/core';
const urlsPath = urls?.cipher?.merchant

type MerchantProps = {
  country: string;
  city: string;
  user:string
  setCountry: (value: string) => void;
  setCity: (value: string) => void;
  setUser: (user : string) => void;
};


const MerchantMetaData = ({country,setCountry,city,setCity, user, setUser} : MerchantProps)=> {
    const merchantMetaData =  new CipherAPI(urlsPath?.metadata)

    const {  data } = useQuery(
          ['merchant-metadata'],
          () => merchantMetaData.list({ })
      );

      var cities = data?.data?.cities
      var countries = data?.data?.countries
      var users = data?.data?.users
   
      const [cityOptionss, setCityOptionss] = useState<{ value: string; label: string; }[]>([]);
      const [countryOptionss, setCountryOptionss] = useState<{ value: string; label: string; }[]>([]);
      const [userOptionss, setUserOptionss] = useState<{ value: string; label: string; }[]>([]);


       useEffect(() => {
                  if (cities && cities.length > 0) {
                  const cityOptions = cities.map((city:any) => ({
                      value: city.id,
                      label: city.name,
                  }));
                  setCityOptionss(cityOptions);
                  }
                  if(countries && countries.length > 0){
                    const countryOptions = countries.map((country:any) => ({
                        value: country.id,
                        label: country.name,
                      })) 
                      setCountryOptionss(countryOptions)
                    }
                    if(users && users.length > 0){
                      const userOptions = users.map((user:any) => ({
                          value: user.id,
                          label: user.username,
                        })) 
                        setUserOptionss(userOptions)
                      }
              }, [cities, countries, users]);

  return (
    <div>
     <Group position='left' spacing={15} align='normal'>
       <Select
                                                                      name="city"
                                                                      placeholder="Cities"
                                                                      value={city !== '' ? city : null}
                                                                      maw={200}
                                                                      size="md" 
                                                                      data={cityOptionss}
                                                                      onChange={(value:any) => setCity(value as string)}
                                                                      clearable
                                                                      nothingFound="No cities found"
                                                                      style={{ marginBottom: 0 }}
                                                                      />
                                                                      
                                                                <Select
                                                                name="country"
                                                                placeholder="Countries"
                                                                value={country !== '' ? country : null}
                                                                maw={200}
                                                                size="md"
                                                                data={countryOptionss} 
                                                                onChange={(value:any) => setCountry(value as string)}
                                                                clearable
                                                                nothingFound="No countries found"
                                                                style={{ marginBottom: 0 }}
                                                            />

                                                             <Select
                                                                name="user"
                                                                placeholder="Users"
                                                                value={user ? user : null}
                                                                maw={230}
                                                                size="md"
                                                                data={userOptionss} 
                                                                onChange={(value:any) => setUser(value as string)}
                                                                clearable
                                                                nothingFound="No users found"
                                                                style={{ marginBottom: 0 }}
                                                            />
                                                            </Group>
    </div>
  )
}
export default MerchantMetaData