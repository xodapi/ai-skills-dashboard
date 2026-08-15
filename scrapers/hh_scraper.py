"""
HeadHunter.ru API scraper for AI/ML vacancies.
"""
import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

import httpx
from httpx import AsyncClient

from app.core.config import settings

logger = logging.getLogger(__name__)


class HHScraper:
    """HeadHunter.ru API scraper."""
    
    BASE_URL = "https://api.hh.ru"
    
    def __init__(self):
        self.headers = {
            "User-Agent": settings.USER_AGENT,
            "HH-User-Agent": "AI Skills Dashboard (sbb@bsosh3.org)",
        }
        if settings.HH_API_KEY:
            self.headers["Authorization"] = f"Bearer {settings.HH_API_KEY}"
    
    async def search_vacancies(
        self,
        text: str = "AI engineer OR ML engineer OR machine learning",
        area: Optional[int] = None,
        per_page: int = 100,
        page: int = 0,
    ) -> Dict[str, Any]:
        """
        Search vacancies using HH.ru API.
        
        Args:
            text: Search query
            area: Area ID (1 = Moscow, 2 = St. Petersburg, 113 = Russia)
            per_page: Results per page (max 100)
            page: Page number
            
        Returns:
            Dictionary with vacancies and metadata
        """
        params = {
            "text": text,
            "per_page": min(per_page, 100),
            "page": page,
            "order_by": "publication_time",
        }
        
        if area:
            params["area"] = area
        
        async with AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/vacancies",
                    params=params,
                    headers=self.headers,
                    timeout=30.0,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching vacancies: {e}")
                raise
    
    async def get_vacancy_details(self, vacancy_id: str) -> Dict[str, Any]:
        """
        Get detailed vacancy information.
        
        Args:
            vacancy_id: Vacancy ID from HH.ru
            
        Returns:
            Dictionary with full vacancy details
        """
        async with AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/vacancies/{vacancy_id}",
                    headers=self.headers,
                    timeout=30.0,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching vacancy {vacancy_id}: {e}")
                raise
    
    async def scrape_all_pages(
        self,
        text: str = "AI engineer OR ML engineer OR machine learning",
        area: Optional[int] = None,
        max_pages: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Scrape multiple pages of vacancies.
        
        Args:
            text: Search query
            area: Area ID
            max_pages: Maximum number of pages to fetch
            
        Returns:
            List of all vacancies
        """
        all_vacancies = []
        
        for page in range(max_pages):
            try:
                result = await self.search_vacancies(
                    text=text,
                    area=area,
                    page=page,
                )
                
                vacancies = result.get("items", [])
                if not vacancies:
                    break
                
                all_vacancies.extend(vacancies)
                
                # Respect rate limits
                await asyncio.sleep(0.5)
                
                # Check if we've reached the last page
                if page >= result.get("pages", 0) - 1:
                    break
                    
            except Exception as e:
                logger.error(f"Error scraping page {page}: {e}")
                break
        
        logger.info(f"Scraped {len(all_vacancies)} vacancies from HH.ru")
        return all_vacancies
    
    def parse_vacancy(self, vacancy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse vacancy data into normalized format.
        
        Args:
            vacancy: Raw vacancy data from API
            
        Returns:
            Normalized vacancy dictionary
        """
        salary = vacancy.get("salary") or {}
        area = vacancy.get("area") or {}
        employer = vacancy.get("employer") or {}
        
        return {
            "external_id": str(vacancy.get("id")),
            "source": "hh",
            "title": vacancy.get("name", ""),
            "company": employer.get("name"),
            "description": vacancy.get("snippet", {}).get("requirement", ""),
            "requirements": vacancy.get("snippet", {}).get("responsibility", ""),
            "city": area.get("name"),
            "country": "Russia",
            "salary_min": salary.get("from"),
            "salary_max": salary.get("to"),
            "salary_currency": salary.get("currency"),
            "experience_years": self._parse_experience(vacancy.get("experience", {})),
            "employment_type": vacancy.get("employment", {}).get("name"),
            "is_active": not vacancy.get("archived", False),
            "url": vacancy.get("alternate_url"),
            "published_at": self._parse_datetime(vacancy.get("published_at")),
            "raw_data": vacancy,
        }
    
    def _parse_experience(self, experience: Dict[str, Any]) -> Optional[int]:
        """Parse experience requirement to years."""
        exp_id = experience.get("id", "")
        
        mapping = {
            "noExperience": 0,
            "between1And3": 2,
            "between3And6": 4,
            "moreThan6": 7,
        }
        
        return mapping.get(exp_id)
    
    def _parse_datetime(self, dt_string: Optional[str]) -> Optional[datetime]:
        """Parse datetime string from API."""
        if not dt_string:
            return None
        
        try:
            return datetime.fromisoformat(dt_string.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return None


async def main():
    """Test scraper."""
    scraper = HHScraper()
    
    # Test search
    result = await scraper.search_vacancies()
    print(f"Found {result.get('found')} vacancies")
    print(f"Fetched {len(result.get('items', []))} items")
    
    # Test scraping all pages
    vacancies = await scraper.scrape_all_pages(max_pages=2)
    print(f"Scraped {len(vacancies)} vacancies total")


if __name__ == "__main__":
    asyncio.run(main())
