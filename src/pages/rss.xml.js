import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

// /rss.xml — the blog feed. Mirrors the same collection + sort the pages use.
export async function GET(context) {
    const posts = (await getCollection("blog")).sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
    );

    return rss({
        title: "Appsecmonarch",
        description:
            "Belajar keamanan aplikasi, satu konsep dalam satu waktu. Tulisan seputar application security untuk developer — tenang, padat, tanpa jargon.",
        // context.site is astro.config's `site` (https://appsecmonarch.com).
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.pubDate,
            link: `/blog/${post.slug}/`,
            categories: post.data.tags ?? [],
        })),
        customData: "<language>id-ID</language>",
    });
}
