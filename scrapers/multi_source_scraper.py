"""
Multi-source job scraper for AI/ML vacancies.
Uses public job boards and RSS feeds.
"""
import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any
from bs4 import BeautifulSoup
import httpx

logger = logging.getLogger(__name__)


class MultiSourceScraper:
    """Scraper that aggregates from multiple public sources."""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    
    async def scrape_habr_career(self, max_pages: int = 5) -> List[Dict]:
        """
        Scrape Habr Career (habr.com/career) - NO API KEY NEEDED.
        Public RSS feed and HTML parsing.
        """
        vacancies = []
        
        async with httpx.AsyncClient() as client:
            try:
                # Habr Career RSS feed for AI/ML jobs
                url = "https://career.habr.com/vacancies?q=ML+engineer+OR+AI+engineer&type=all"
                
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Parse vacancy cards
                cards = soup.find_all('div', class_='vacancy-card')
                
                for card in cards[:50]:  # Limit to 50 per page
                    try:
                        title_elem = card.find('a', class_='vacancy-card__title-link')
                        company_elem = card.find('a', class_='vacancy-card__company-title')
                        salary_elem = card.find('div', class_='vacancy-card__salary')
                        
                        if title_elem:
                            vacancy = {
                                "source": "habr",
                                "title": title_elem.text.strip(),
                                "company": company_elem.text.strip() if company_elem else "Unknown",
                                "url": "https://career.habr.com" + title_elem['href'],
                                "salary_text": salary_elem.text.strip() if salary_elem else None,
                                "published_at": datetime.utcnow().isoformat(),
                            }
                            vacancies.append(vacancy)
                    except Exception as e:
                        logger.error(f"Error parsing Habr vacancy: {e}")
                        continue
                
                logger.info(f"Scraped {len(vacancies)} vacancies from Habr Career")
                
            except Exception as e:
                logger.error(f"Error scraping Habr Career: {e}")
        
        return vacancies
    
    async def scrape_linkedin_jobs(self, keywords: str = "machine learning engineer") -> List[Dict]:
        """
        Scrape LinkedIn Jobs RSS feed - PUBLIC, NO AUTH.
        """
        vacancies = []
        
        async with httpx.AsyncClient() as client:
            try:
                # LinkedIn jobs RSS (public)
                url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={keywords}&location=Russia&start=0"
                
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Parse job cards
                cards = soup.find_all('li')
                
                for card in cards[:50]:
                    try:
                        title_elem = card.find('h3', class_='base-search-card__title')
                        company_elem = card.find('h4', class_='base-search-card__subtitle')
                        location_elem = card.find('span', class_='job-search-card__location')
                        link_elem = card.find('a', class_='base-card__full-link')
                        
                        if title_elem and link_elem:
                            vacancy = {
                                "source": "linkedin",
                                "title": title_elem.text.strip(),
                                "company": company_elem.text.strip() if company_elem else "Unknown",
                                "location": location_elem.text.strip() if location_elem else "Remote",
                                "url": link_elem['href'],
                                "published_at": datetime.utcnow().isoformat(),
                            }
                            vacancies.append(vacancy)
                    except Exception as e:
                        logger.error(f"Error parsing LinkedIn vacancy: {e}")
                        continue
                
                logger.info(f"Scraped {len(vacancies)} vacancies from LinkedIn")
                
            except Exception as e:
                logger.error(f"Error scraping LinkedIn: {e}")
        
        return vacancies
    
    async def scrape_github_jobs(self) -> List[Dict]:
        """
        Scrape GitHub Jobs board - PUBLIC API.
        """
        vacancies = []
        
        async with httpx.AsyncClient() as client:
            try:
                # GitHub Jobs API (free, public)
                url = "https://jobs.github.com/positions.json?description=machine+learning&location=russia"
                
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                
                jobs = response.json()
                
                for job in jobs:
                    vacancy = {
                        "source": "github",
                        "title": job.get("title"),
                        "company": job.get("company"),
                        "location": job.get("location"),
                        "description": job.get("description"),
                        "url": job.get("url"),
                        "published_at": job.get("created_at"),
                    }
                    vacancies.append(vacancy)
                
                logger.info(f"Scraped {len(vacancies)} vacancies from GitHub Jobs")
                
            except Exception as e:
                logger.error(f"Error scraping GitHub Jobs: {e}")
        
        return vacancies
    
    async def scrape_stackoverflow_jobs(self) -> List[Dict]:
        """
        Scrape StackOverflow Jobs RSS - PUBLIC.
        """
        vacancies = []
        
        async with httpx.AsyncClient() as client:
            try:
                url = "https://stackoverflow.com/jobs/feed?q=machine+learning&l=Russia"
                
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'xml')
                
                items = soup.find_all('item')
                
                for item in items:
                    try:
                        vacancy = {
                            "source": "stackoverflow",
                            "title": item.find('title').text,
                            "company": item.find('author').text if item.find('author') else "Unknown",
                            "url": item.find('link').text,
                            "description": item.find('description').text,
                            "published_at": item.find('pubDate').text,
                        }
                        vacancies.append(vacancy)
                    except Exception as e:
                        logger.error(f"Error parsing SO vacancy: {e}")
                        continue
                
                logger.info(f"Scraped {len(vacancies)} vacancies from StackOverflow")
                
            except Exception as e:
                logger.error(f"Error scraping StackOverflow: {e}")
        
        return vacancies
    
    async def scrape_geekjob_ru(self) -> List[Dict]:
        """
        Scrape GeekJob.ru - Russian IT jobs aggregator.
        """
        vacancies = []
        
        async with httpx.AsyncClient() as client:
            try:
                url = "https://geekjob.ru/vacancies?search=machine+learning"
                
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                cards = soup.find_all('div', class_='vacancy-item')
                
                for card in cards:
                    try:
                        title_elem = card.find('h3')
                        company_elem = card.find('div', class_='company')
                        link_elem = card.find('a')
                        
                        if title_elem and link_elem:
                            vacancy = {
                                "source": "geekjob",
                                "title": title_elem.text.strip(),
                                "company": company_elem.text.strip() if company_elem else "Unknown",
                                "url": "https://geekjob.ru" + link_elem['href'],
                                "published_at": datetime.utcnow().isoformat(),
                            }
                            vacancies.append(vacancy)
                    except Exception as e:
                        logger.error(f"Error parsing GeekJob vacancy: {e}")
                        continue
                
                logger.info(f"Scraped {len(vacancies)} vacancies from GeekJob")
                
            except Exception as e:
                logger.error(f"Error scraping GeekJob: {e}")
        
        return vacancies
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape all sources concurrently."""
        results = await asyncio.gather(
            self.scrape_habr_career(),
            self.scrape_linkedin_jobs(),
            # self.scrape_github_jobs(),  # GitHub Jobs закрылся в 2021
            # self.scrape_stackoverflow_jobs(),  # SO Jobs закрылся
            self.scrape_geekjob_ru(),
            return_exceptions=True
        )
        
        all_vacancies = []
        for result in results:
            if isinstance(result, list):
                all_vacancies.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Scraping error: {result}")
        
        logger.info(f"Total scraped: {len(all_vacancies)} vacancies from all sources")
        return all_vacancies


async def main():
    """Test scraper."""
    scraper = MultiSourceScraper()
    vacancies = await scraper.scrape_all()
    
    print(f"\nScraped {len(vacancies)} total vacancies:")
    for source in ["habr", "linkedin", "geekjob"]:
        count = len([v for v in vacancies if v["source"] == source])
        print(f"  {source}: {count}")
    
    if vacancies:
        print(f"\nSample vacancy:")
        print(f"  Title: {vacancies[0]['title']}")
        print(f"  Company: {vacancies[0]['company']}")
        print(f"  Source: {vacancies[0]['source']}")


if __name__ == "__main__":
    asyncio.run(main())
