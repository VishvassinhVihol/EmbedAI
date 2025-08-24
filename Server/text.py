from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_qdrant import QdrantVectorStore
import json

def text(Text, user_query, api_key, qdrant_url, qdrant_api_key=None):
    print('text.py')

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.create_documents([Text])

    # Embeddings
    embedder = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=api_key
    )

    print("⚙️ Testing embedding manually...")
    try:
        test_embedding = embedder.embed_query("hello test")
        print("✅ Embedding success. Length:", len(test_embedding))
    except Exception as e:
        print("❌ Embedding failed:", str(e))
        raise

    # Save to Qdrant
    print('qurl: ', qdrant_url)
    vector_store = QdrantVectorStore.from_documents(
        documents=docs,
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    retriever = QdrantVectorStore.from_existing_collection(
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    client = ChatOpenAI(
        model="gpt-4o",
        max_tokens=100,
        temperature=0,
        api_key=api_key,
    )

    # Step 1: Generate hypothetical answer
    system_prompt = """
        You are an expert agent.
        Your task is to generate a helpful answer based on the user's query.

        Instructions:
        - Focus on clarity and correctness.
        - Assume the user is a beginner unless stated otherwise.
        - Avoid jargon where possible.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]

    response = client.chat.completions.create(messages=messages)
    hypothetical_answer = response.choices[0].message.content.strip()

    # Step 2: Search for related documents
    related_docs = retriever.similarity_search(query=hypothetical_answer)

    if not related_docs:
        return "Sorry, I couldn't find any relevant information to answer your question."

    # Step 3: Final prompt
    final_prompt = f"""
        You are an expert in Retrieval-Augmented Generation (RAG) and LLM-based systems.
        Your task is to generate a clear and accurate answer based on the user's query and the documents provided.

        User Query: {user_query}

        Relevant Documents:
        {json.dumps([doc.page_content for doc in related_docs], indent=2)}

        Generate a final answer. Do not include extra commentary.
    """

    final_response = client.chat.completions.create(
        messages=[{"role": "system", "content": final_prompt}]
    )

    final_answer = final_response.choices[0].message.content.strip()
    return final_answer
