"use client"

import { useState } from 'react';
import { Group, Button, Input, Title, Text } from '@mantine/core';

const url = "https://op64a8aate.execute-api.us-east-1.amazonaws.com/v1"

export default function HomePage() {

  const [city, setCity] = useState("Melbourne");
  const [data, setData] = useState<string | undefined>(undefined)

  const fetchWeather = async (city: string) => {
    setData(undefined)
    const response = await fetch(`${url}/weather/${city}`)
    const result = await response.json();
    setData(JSON.stringify(result.result.data, null, 2))
    // return result.result.data;
  }

  const fetchWeatherHistory = async (city: string) => {
    setData(undefined)
    const response = await fetch(`${url}/weather/history/${city}`)
    const result = await response.json();
    setData(JSON.stringify(result.result.history, null, 2))
    // return result.result.data;
  }

  return (
    <div>
      <Title order={1} p={20}>Weather Service</Title>

      <Group justify="center">
        <Input.Wrapper label="City" description="Enter city to fetch weather">
          <Input
            value={city}
            onChange={(event) => setCity(event.currentTarget.value)}
          />
        </Input.Wrapper>
      </Group>

      <Group justify="center" pt={10}>
        <Button onClick={() => fetchWeather(city)}>Fetch Weather</Button>
        <Button onClick={() => fetchWeatherHistory(city)}>Fetch Weather History</Button>
      </Group>

      <Group justify="center" p={40}>
        {data && <pre>{data}</pre>}
      </Group>
    </div>
  );
}
